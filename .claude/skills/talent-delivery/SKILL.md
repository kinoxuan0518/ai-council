---
name: talent-delivery
description: >
  邮件触达执行技能。接收 talent-outreach 生成的消息 → 确认后通过 SMTP 实际发送，写入本地日志。
  仅处理邮件渠道（其他渠道如脉脉/BOSS自带发送能力）。
  触发关键词："发送触达邮件"、"send outreach"、"发出这封邮件"、"确认发送"。
---

## Purpose

Send outreach emails. This is the execution layer after `talent-outreach` generates
the message text. One job only: receive a message, confirm with the user, send via
SMTP, and log the result.

## Why Only Email

Other outreach channels (maimai, BOSS, LinkedIn) have their own sending mechanisms
built into their respective skills. Email is the only channel that needs a separate
delivery layer — it's the universal fallback when a candidate is found on one
platform but you want to reach them directly.

## Prerequisites

SMTP credentials must be configured once. Set as environment variables or in
`~/.claude/settings.local.json` under `env`:

```json
{
  "env": {
    "SMTP_HOST": "smtp.aliyun.com",
    "SMTP_PORT": "465",
    "SMTP_USER": "your-email@example.com",
    "SMTP_PASS": "your-password-or-token",
    "SMTP_FROM_NAME": "Kino"
  }
}
```

Common SMTP settings:
- Alibaba Mail: `smtp.aliyun.com`, port 465 (SSL)
- Gmail: `smtp.gmail.com`, port 587 (STARTTLS), requires app password
- Outlook: `smtp-mail.outlook.com`, port 587 (STARTTLS)

## Workflow

```
talent-outreach 生成消息
    ↓
talent-delivery 接收 { to, subject, body, candidate_name }
    ↓
1. 展示最终消息给用户确认（收件人、主题、正文全文）
    ↓
2. 用户确认后，通过 SMTP 发送
    ↓
3. 写入本地日志 ~/.claude/outreach-log/{YYYY-MM-DD}.md
    ↓
4. 返回发送结果
```

## Confirmation (Mandatory)

Before sending, ALWAYS show the user:
```
收件人: xxx@xxx.com
主题: xxx
正文:
---
[full message body]
---
确认发送？[yes/no]
```

Never send without explicit user approval.

## SMTP Sending

On macOS, use Python's built-in `smtplib` (no external dependencies):

```python
import smtplib, ssl, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

msg = MIMEMultipart()
msg["From"] = f"{os.environ['SMTP_FROM_NAME']} <{os.environ['SMTP_USER']}>"
msg["To"] = recipient
msg["Subject"] = subject
msg.attach(MIMEText(body, "plain", "utf-8"))

ctx = ssl.create_default_context()
with smtplib.SMTP_SSL(os.environ["SMTP_HOST"], int(os.environ["SMTP_PORT"]), context=ctx) as s:
    s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
    s.send_message(msg)
```

## Logging

After each send, append to `~/.claude/outreach-log/{YYYY-MM-DD}.md`:

```markdown
| Time | Candidate | Email | Subject | Status |
|------|-----------|-------|---------|--------|
| 14:23 | 陈泽徽 | lovesnowbest@gmail.com | UI-TARS 和物理世界... | ✅ sent |
```

Log file is local only — never committed to git.

## Integration

```yaml
# How other skills call talent-delivery:

# 1. targeted-hunting finds a P0 candidate with email
# 2. Calls talent-outreach.generate(candidate, channel="email")
# 3. Receives { message: { subject, body }, ... }
# 4. Calls talent-delivery with the message
# 5. User confirms, email is sent, result logged
```

## Non-Goals

- Does not handle non-email channels (maimai, BOSS, LinkedIn have their own sending)
- Does not generate message content (that's talent-outreach's job)
- Does not track candidate status beyond send log (that's the caller's job)
- Does not store email credentials in plaintext in the skill file
