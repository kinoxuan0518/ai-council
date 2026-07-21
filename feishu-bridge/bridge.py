#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
飞书 → 这台 Mac 的 Claude Code 桥。
你在飞书里对机器人发一句话 -> 这台机器上的 claude 无头执行 -> 结果回帖到飞书。

飞书不执行任何东西，它只是遥控器。真正干活、也必须一直醒着的是这台 Mac。
"""

import json
import os
import subprocess
import threading
from pathlib import Path

import lark_oapi as lark
from lark_oapi.api.im.v1 import (
    P2ImMessageReceiveV1,
    CreateMessageRequest,
    CreateMessageRequestBody,
)

BASE = Path(__file__).resolve().parent
CFG = json.loads((BASE / "config.json").read_text(encoding="utf-8"))

APP_ID = CFG["app_id"]
APP_SECRET = CFG["app_secret"]
ALLOWED_OPEN_ID = str(CFG.get("allowed_open_id", "")).strip()
WORKDIR = os.path.expanduser(CFG.get("workdir", "~"))
CLAUDE_BIN = CFG.get("claude_bin", "claude")
CLAUDE_ARGS = CFG.get("claude_args", ["--dangerously-skip-permissions"])
TIMEOUT = int(CFG.get("timeout_seconds", 600))

# 灵魂层：参谋立场，注入每次调用的 system prompt。改 stance.md + 重启即生效。
try:
    STANCE = (BASE / "stance.md").read_text(encoding="utf-8").strip()
except FileNotFoundError:
    STANCE = ""

client = lark.Client.builder().app_id(APP_ID).app_secret(APP_SECRET).build()


def reply_text(chat_id: str, text: str) -> None:
    """回一条文字消息到会话。长文本自动切块。"""
    for chunk in _chunks(text, 3500):
        body = (
            CreateMessageRequestBody.builder()
            .receive_id(chat_id)
            .msg_type("text")
            .content(json.dumps({"text": chunk}, ensure_ascii=False))
            .build()
        )
        req = (
            CreateMessageRequest.builder()
            .receive_id_type("chat_id")
            .request_body(body)
            .build()
        )
        resp = client.im.v1.message.create(req)
        if not resp.success():
            print(f"[reply-fail] code={resp.code} msg={resp.msg}", flush=True)


def _chunks(s: str, n: int):
    if not s:
        return [""]
    return [s[i : i + n] for i in range(0, len(s), n)]


SESSION_FILE = BASE / "session.txt"
_run_lock = threading.Lock()  # 串行执行，保证会话续接不打架


def _load_session():
    try:
        return SESSION_FILE.read_text(encoding="utf-8").strip() or None
    except FileNotFoundError:
        return None


def _save_session(sid: str) -> None:
    if sid:
        SESSION_FILE.write_text(sid, encoding="utf-8")


def reset_session() -> None:
    try:
        SESSION_FILE.unlink()
    except FileNotFoundError:
        pass


def run_claude(prompt: str) -> str:
    """把 prompt 交给本机 claude 无头执行；用 --resume 串起上下文。"""
    with _run_lock:
        sid = _load_session()
        cmd = [CLAUDE_BIN, "-p", prompt, "--output-format", "json"]
        if STANCE:
            cmd += ["--append-system-prompt", STANCE]  # 注入参谋立场
        if sid:
            cmd += ["--resume", sid]  # 接着上一轮对话，而不是冷启动
        cmd += CLAUDE_ARGS
        try:
            proc = subprocess.run(
                cmd, cwd=WORKDIR, capture_output=True, text=True, timeout=TIMEOUT
            )
        except subprocess.TimeoutExpired:
            return f"⏱️ 执行超时（>{TIMEOUT}s），已中止。"
        except FileNotFoundError:
            return f"❌ 找不到 claude 可执行文件：{CLAUDE_BIN}"

        raw = (proc.stdout or "").strip()
        err = (proc.stderr or "").strip()
        if not raw:
            return f"⚠️ 无输出。stderr：\n{err}" if err else "(claude 没有返回任何内容)"

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return raw  # 兜底：非 JSON 直接回原文

        new_sid = data.get("session_id")
        if new_sid:
            _save_session(new_sid)  # 记住最新会话 id，下一轮接着用

        text = data.get("result")
        if text is None:
            text = raw
        if data.get("is_error"):
            return f"⚠️ claude 报错：\n{text}"
        return text or "(claude 返回为空)"


def _handle(chat_id: str, text: str) -> None:
    """在后台线程里跑，别堵住长连接的心跳。"""
    result = run_claude(text)
    reply_text(chat_id, result)
    print("[done]", flush=True)


def on_message(data: P2ImMessageReceiveV1) -> None:
    ev = data.event
    sender = ev.sender.sender_id.open_id
    chat_id = ev.message.chat_id
    msg_type = ev.message.message_type

    # 引导模式：还没锁定 open_id -> 把 id 回给用户，拒绝执行任何命令
    if not ALLOWED_OPEN_ID:
        reply_text(
            chat_id,
            "🔓 引导模式：你的 open_id 是\n"
            f"{sender}\n"
            "把它填进 config.json 的 allowed_open_id，重启我，就锁定了。",
        )
        print(f"[bootstrap] open_id={sender}", flush=True)
        return

    # 锁：只认你一个人
    if sender != ALLOWED_OPEN_ID:
        print(f"[ignore] sender={sender} 不在白名单", flush=True)
        return

    if msg_type != "text":
        reply_text(chat_id, "暂时只认文字消息。")
        return

    text = json.loads(ev.message.content).get("text", "").strip()
    if not text:
        return

    if text in ("/reset", "/新对话", "新对话", "开新对话", "清空上下文", "新话题"):
        reset_session()
        reply_text(chat_id, "🧹 已开新对话，上下文清空。下一句从头开始。")
        print("[reset] session cleared", flush=True)
        return

    print(f"[recv] {text}", flush=True)
    threading.Thread(target=_handle, args=(chat_id, text), daemon=True).start()


def main() -> None:
    handler = (
        lark.EventDispatcherHandler.builder("", "")
        .register_p2_im_message_receive_v1(on_message)
        .build()
    )
    ws = lark.ws.Client(
        APP_ID, APP_SECRET, event_handler=handler, log_level=lark.LogLevel.INFO
    )
    lock = "OFF（引导模式）" if not ALLOWED_OPEN_ID else ALLOWED_OPEN_ID
    print(f"[bridge] workdir={WORKDIR}  lock={lock}", flush=True)
    print("[bridge] 长连接启动中，去飞书给机器人发条消息试试…", flush=True)
    ws.start()


if __name__ == "__main__":
    main()
