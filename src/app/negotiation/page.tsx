'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  buildAnalysisUserMessage,
  buildCoachSystemPrompt,
  buildNpcSystemPrompt,
  emotionToExpression,
  Expression,
  GameSettings,
  PersonaSetup,
  Round,
  SETTINGS_KEY,
  stripMarkersFinal,
  stripMarkersStreaming,
  parseMeta,
  saveGameRecord,
  tempLabel,
} from '@/lib/negotiation';
import { parseOpenAIStream } from '@/lib/stream';
import StageBackground from '@/components/negotiation/StageBackground';
import CharacterSprite from '@/components/negotiation/CharacterSprite';
import SetupScreen from '@/components/negotiation/SetupScreen';
import DialogueBox from '@/components/negotiation/DialogueBox';
import ResultScreen from '@/components/negotiation/ResultScreen';
import SettingsModal from '@/components/negotiation/SettingsModal';
import HistoryPanel from '@/components/negotiation/HistoryPanel';

const DEFAULT_SETUP: PersonaSetup = {
  mode: 'hr',
  difficulty: 'standard',
  npcName: '林晓',
  npcVariant: 'candidateF',
  npcTitle: '候选人 · 高级前端工程师',
};

const DEFAULT_SETTINGS: GameSettings = {
  provider: 'glm',
  model: 'glm-4-plus',
  apiKey: '',
  ttsEnabled: true,
  voiceAutoSend: true,
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const uid = () => Math.random().toString(36).slice(2, 10);

export default function NegotiationPage() {
  const [stage, setStage] = useState<'setup' | 'playing' | 'analysis'>('setup');
  const [setup, setSetup] = useState<PersonaSetup>(DEFAULT_SETUP);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [npcText, setNpcText] = useState('');
  const [npcThinking, setNpcThinking] = useState(false);
  const [npcStreaming, setNpcStreaming] = useState(false);
  const [expression, setExpression] = useState<Expression>('neutral');
  const [lastAction, setLastAction] = useState<string | undefined>();
  const [temp, setTemp] = useState(50);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [resultText, setResultText] = useState('');
  const [resultStreaming, setResultStreaming] = useState(false);

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const apiMessagesRef = useRef<{ role: string; content: string }[]>([]);
  const roundsRef = useRef<Round[]>([]);
  const recRef = useRef<any>(null);
  const finalVoiceRef = useRef('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const analysisSavedRef = useRef(false);

  useEffect(() => {
    roundsRef.current = rounds;
  }, [rounds]);

  // 加载设置
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const persistSettings = useCallback((s: GameSettings) => {
    setSettings(s);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }, []);

  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ---------- 语音合成 TTS ----------
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!settings.ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const clean = text.replace(/[（(][^）)]*[)）]/g, '').slice(0, 300);
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'zh-CN';
      u.rate = 1.05;
      const voices = voicesRef.current.filter((v) => v.lang?.startsWith('zh'));
      const femaleHint = /(Tingting|Ting-Ting|Xiaoxiao|Yaoyao|Meijia|Sinji|Huihui|female|女)/i;
      const maleHint = /(Yunxi|Yunjian|Yunyang|Kangkang|male|男)/i;
      const preferFemale = setup.npcVariant.endsWith('F');
      const voice =
        voices.find((v) => (preferFemale ? femaleHint : maleHint).test(v.name)) ||
        voices.find((v) => (preferFemale ? !maleHint.test(v.name) : !femaleHint.test(v.name))) ||
        voices[0];
      if (voice) u.voice = voice;
      u.pitch = preferFemale ? 1.08 : 0.92;
      window.speechSynthesis.speak(u);
    },
    [settings.ttsEnabled, setup.npcVariant]
  );

  // ---------- 语音识别（Fn 按住说话） ----------
  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const startListening = useCallback(() => {
    if (listening || stage !== 'playing') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      flashToast('当前浏览器不支持语音识别，建议使用 Chrome / Edge');
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    finalVoiceRef.current = '';
    rec.onresult = (e: any) => {
      let inter = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalVoiceRef.current += r[0].transcript;
        else inter += r[0].transcript;
      }
      setInterim(inter || finalVoiceRef.current);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      setInterim('');
      if (e.error !== 'aborted' && e.error !== 'no-speech') flashToast(`语音识别失败：${e.error}`);
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
      const finalText = finalVoiceRef.current.trim();
      if (!finalText) return;
      if (settings.voiceAutoSend && !npcThinking && !npcStreaming) {
        sendRef.current?.(finalText);
      } else {
        setInput((prev) => (prev ? prev + finalText : finalText));
      }
    };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch { /* ignore */ }
  }, [listening, stage, settings.voiceAutoSend, npcThinking, npcStreaming, flashToast]);

  // Fn 键按住说话
  useEffect(() => {
    if (stage !== 'playing') return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Fn' && !e.repeat) {
        const active = document.activeElement;
        const typing = active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement;
        e.preventDefault();
        if (!typing) startListening();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Fn') stopListening();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [stage, startListening, stopListening]);

  // ---------- LLM 调用 ----------
  const streamChat = useCallback(
    async (body: Record<string, unknown>, onChunk: (full: string) => void): Promise<string> => {
      const res = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) {
        throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      let full = '';
      for await (const chunk of parseOpenAIStream(res.body)) {
        full += chunk;
        onChunk(full);
      }
      return full;
    },
    []
  );

  const runAnalysis = useCallback(
    async (declared: 'deal' | 'break', endCondition?: string) => {
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      setStage('analysis');
      setResultText('');
      setResultStreaming(true);
      const extra = endCondition
        ? `\n\n【系统检测】对局以「${declared === 'deal' ? '成交' : '破裂'}」结束，条件：${endCondition}`
        : '';
      let analysis = '';
      try {
        analysis = await streamChat(
          {
            provider: settings.provider,
            model: settings.model,
            apiKey: settings.apiKey,
            temperature: 0.6,
            systemPrompt: buildCoachSystemPrompt(setup),
            messages: [{ role: 'user', content: buildAnalysisUserMessage(setup, roundsRef.current, declared) + extra }],
          },
          (full) => setResultText(full)
        );
      } catch (e) {
        analysis = `⚠️ 复盘生成失败：${e instanceof Error ? e.message : e}`;
        setResultText(analysis);
      } finally {
        setResultStreaming(false);
      }
      // 保存对局历史（同一局只存一次）
      if (!analysisSavedRef.current) {
        const transcript = roundsRef.current
          .filter((r) => !r.hidden && r.role !== 'system')
          .map((r) => ({ role: r.role as 'player' | 'npc', text: r.text, action: r.meta?.action }));
        if (transcript.length > 0) {
          saveGameRecord({
            id: uid(),
            date: new Date().toISOString(),
            mode: setup.mode,
            npcName: setup.npcName,
            npcTitle: setup.npcTitle,
            difficulty: setup.difficulty,
            outcome: declared,
            endCondition,
            roundsCount: transcript.length,
            transcript,
            analysis,
          });
          analysisSavedRef.current = true;
          setHistoryRefreshKey((k) => k + 1);
        }
      }
    },
    [setup, settings, streamChat]
  );

  const callNpc = useCallback(async () => {
    setNpcThinking(true);
    setNpcStreaming(false);
    setNpcText('');
    setLastAction(undefined);
    try {
      let firstChunk = true;
      const full = await streamChat(
        {
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          temperature: 0.9,
          systemPrompt: buildNpcSystemPrompt(setup),
          messages: apiMessagesRef.current,
        },
        (f) => {
          if (firstChunk) {
            firstChunk = false;
            setNpcThinking(false);
            setNpcStreaming(true);
          }
          setNpcText(stripMarkersStreaming(f));
        }
      );
      setNpcThinking(false);
      setNpcStreaming(false);
      const meta = parseMeta(full);
      const display = stripMarkersFinal(full) || '……';
      // 历史中锚定元数据格式，防止模型后续省略
      const fullForHistory = full.includes('[[')
        ? full
        : `${full}\n[[情绪:平静|温度:0|动作:沉默]]`;
      apiMessagesRef.current.push({ role: 'assistant', content: fullForHistory });
      setExpression(emotionToExpression(meta.emotion));
      setLastAction(meta.action);
      if (meta.tempDelta) setTemp((t) => clamp(t + meta.tempDelta!));
      setNpcText(display);
      setRounds((prev) => [...prev, { id: uid(), role: 'npc', text: display, raw: full, meta }]);
      speak(display);
      if (meta.end) {
        const end = meta.end;
        const cond = meta.endCondition;
        setTimeout(() => runAnalysis(end, cond), 1500);
      }
    } catch (e) {
      setNpcThinking(false);
      setNpcStreaming(false);
      const msg = e instanceof Error ? e.message : String(e);
      setRounds((prev) => [...prev, { id: uid(), role: 'system', text: `⚠️ 请求失败：${msg}` }]);
    }
  }, [setup, settings, speak, streamChat, runAnalysis]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || npcThinking || npcStreaming || stage !== 'playing') return;
      if (!settings.apiKey) {
        setShowSettings(true);
        flashToast('请先在设置中填写 API Key');
        return;
      }
      apiMessagesRef.current.push({
        role: 'user',
        content: `${trimmed}\n(系统提醒：你的回复末尾必须带元数据行[[情绪:…|温度:…|动作:…]])`,
      });
      setRounds((prev) => [...prev, { id: uid(), role: 'player', text: trimmed }]);
      setInput('');
      callNpc();
    },
    [npcThinking, npcStreaming, stage, settings.apiKey, callNpc, flashToast]
  );
  const sendRef = useRef(send);
  useEffect(() => { sendRef.current = send; }, [send]);

  const startGame = useCallback(() => {
    if (!settings.apiKey) {
      setShowSettings(true);
      flashToast('请先在设置中填写 API Key');
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    analysisSavedRef.current = false;
    setRounds([]);
    setTemp(50);
    setExpression('neutral');
    setNpcText('');
    setLastAction(undefined);
    setResultText('');
    apiMessagesRef.current = [
      {
        role: 'user',
        content: '(导演指令：谈判现在开始。请以你的角色身份说出第一句开场白，进入情境。记得遵守元数据协议。)',
      },
    ];
    setStage('playing');
    setTimeout(() => callNpc(), 500);
  }, [settings.apiKey, callNpc, flashToast]);

  // ---------- 渲染 ----------
  if (stage === 'setup') {
    return (
      <div className="min-h-screen relative">
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-rose-500/15 border border-rose-400/30 px-4 py-2 text-sm text-rose-200 backdrop-blur animate-fade-in">
            {toast}
          </div>
        )}
        <button
          onClick={() => setShowHistoryPanel(true)}
          className="fixed top-4 right-4 z-40 rounded-xl bg-black/40 backdrop-blur border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-black/60 transition-all"
        >
          📚 历史对局
        </button>
        <SetupScreen setup={setup} onChange={setSetup} onStart={startGame} />
        {showSettings && (
          <SettingsModal settings={settings} onSave={persistSettings} onClose={() => setShowSettings(false)} />
        )}
        {showHistoryPanel && (
          <HistoryPanel onClose={() => setShowHistoryPanel(false)} refreshKey={historyRefreshKey} />
        )}
      </div>
    );
  }

  if (stage === 'analysis') {
    return (
      <>
        <ResultScreen
          text={resultText}
          streaming={resultStreaming}
          npcName={setup.npcName}
          mode={setup.mode}
          roundsCount={rounds.filter((r) => !r.hidden && r.role !== 'system').length}
          onRestart={() => setStage('setup')}
          onBackHome={() => setStage('setup')}
          onOpenHistory={() => setShowHistoryPanel(true)}
        />
        {showHistoryPanel && (
          <HistoryPanel onClose={() => setShowHistoryPanel(false)} refreshKey={historyRefreshKey} />
        )}
      </>
    );
  }

  const visibleRounds = rounds.filter((r) => !r.hidden && r.role !== 'system');
  const roundNo = Math.ceil(visibleRounds.length / 2);
  const tl = tempLabel(temp);
  const isHr = setup.mode === 'hr';

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none">
      {/* 舞台 */}
      <div className="relative flex-1 min-h-0">
        <StageBackground mood={isHr ? 'warm' : 'cool'} />

        {/* 立绘 */}
        <div className="absolute right-[8%] bottom-[170px] w-[min(300px,36vw)] pointer-events-none">
          <CharacterSprite variant={setup.npcVariant} expression={expression} speaking={npcStreaming} className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]" />
        </div>

        {/* 顶栏 */}
        <div className="absolute top-0 inset-x-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-200 bg-black/30 rounded-lg px-2 py-1 backdrop-blur">←</Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-gray-200">
            {isHr ? '💼 你是HR' : '🧑‍💻 你是候选人'}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-gray-400">
            第 {roundNo} 轮
          </span>

          {/* 谈判温度计 */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10">
            <span className="text-[11px] text-gray-400 shrink-0">谈判温度</span>
            <div className="relative w-24 h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400">
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-800 shadow transition-all duration-700"
                style={{ left: `${temp}%` }}
              />
            </div>
            <span className={`text-[11px] font-medium shrink-0 ${tl.color}`}>{tl.text}</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => {
              const next = { ...settings, ttsEnabled: !settings.ttsEnabled };
              persistSettings(next);
              if (!next.ttsEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            title="对方语音朗读"
            className={`text-sm px-2 py-1 rounded-lg bg-black/40 backdrop-blur border border-white/10 hover:bg-black/60 ${settings.ttsEnabled ? 'text-emerald-300' : 'text-gray-500'}`}
          >
            {settings.ttsEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setShowHistory(true)}
            title="对话记录"
            className="text-sm px-2 py-1 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-gray-300 hover:bg-black/60"
          >
            📜
          </button>
          <button
            onClick={() => setShowSettings(true)}
            title="设置"
            className="text-sm px-2 py-1 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-gray-300 hover:bg-black/60"
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowEndModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-300 to-orange-400 text-[#1c1410] hover:brightness-110"
          >
            结束谈判
          </button>
        </div>

        {/* 对话框 */}
        <div className="absolute inset-x-0 bottom-0">
          <DialogueBox
            name={setup.npcName}
            title={setup.npcTitle}
            text={npcText}
            streaming={npcStreaming}
            thinking={npcThinking}
            expression={expression}
            action={lastAction}
          />
        </div>
      </div>

      {/* 输入区 */}
      <div className="shrink-0 bg-[#0b0e17] border-t border-white/[0.07] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <button
            onPointerDown={(e) => { e.preventDefault(); startListening(); }}
            onPointerUp={stopListening}
            onPointerLeave={stopListening}
            title="按住说话（也可按住键盘 Fn 键）"
            className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center text-lg transition-all ${
              listening
                ? 'border-rose-400/60 bg-rose-500/20 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'border-white/[0.1] bg-white/[0.04] text-gray-400 hover:text-gray-200'
            }`}
          >
            🎤
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={listening && interim ? interim : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={listening ? ' 🎙️ 请讲…（松开结束）' : '自由输入你的谈判话术，Enter 发送 · 按住 Fn 或 🎤 说话'}
              disabled={npcThinking || npcStreaming}
              className="w-full resize-none rounded-xl bg-white/[0.05] border border-white/[0.1] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-amber-300/40 disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || npcThinking || npcStreaming}
            className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 text-[#1c1410] text-lg font-bold disabled:opacity-30 disabled:grayscale transition-all hover:brightness-110"
          >
            ➤
          </button>
        </div>
      </div>

      {/* 历史记录抽屉 */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
          <div className="w-[380px] max-w-[88vw] h-full bg-[#0e1220] border-l border-white/10 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
              <span className="text-sm font-semibold text-gray-200">📜 完整对话记录</span>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-300">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {visibleRounds.map((r) => (
                <div key={r.id} className={`text-sm leading-relaxed ${r.role === 'player' ? 'text-right' : ''}`}>
                  <div className="text-[10px] text-gray-500 mb-0.5">
                    {r.role === 'player' ? '你' : setup.npcName}
                  </div>
                  <div
                    className={`inline-block max-w-[92%] rounded-xl px-3 py-2 ${
                      r.role === 'player'
                        ? 'bg-blue-500/15 text-blue-100 border border-blue-400/20'
                        : 'bg-white/[0.05] text-gray-200 border border-white/[0.07]'
                    }`}
                  >
                    {r.text}
                    {r.meta?.action && <div className="text-[11px] italic text-teal-200/60 mt-1">（{r.meta.action}）</div>}
                  </div>
                </div>
              ))}
              {rounds.some((r) => r.role === 'system') && (
                <div className="text-xs text-rose-300/80">
                  {rounds.filter((r) => r.role === 'system').map((r) => r.text).join(' / ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 结束谈判确认 */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowEndModal(false)}>
          <div className="w-[400px] max-w-[92vw] rounded-2xl border border-white/[0.12] bg-[#10141f] p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-3xl mb-2">🎭</div>
            <h3 className="font-semibold text-gray-100 mb-1">如何收场？</h3>
            <p className="text-xs text-gray-500 mb-5">复盘教练会结合整场对话与你的收场声明生成报告</p>
            <div className="grid gap-2.5">
              <button
                onClick={() => { setShowEndModal(false); runAnalysis('deal'); }}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-300 to-teal-400 text-[#0c1a14] font-semibold hover:brightness-110"
              >
                🤝 双方达成一致
              </button>
              <button
                onClick={() => { setShowEndModal(false); runAnalysis('break'); }}
                className="py-3 rounded-xl bg-gradient-to-r from-rose-300 to-red-400 text-[#1a0c0e] font-semibold hover:brightness-110"
              >
                💔 谈判破裂
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/[0.04]"
              >
                继续谈判
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-rose-500/15 border border-rose-400/30 px-4 py-2 text-sm text-rose-200 backdrop-blur animate-fade-in">
          {toast}
        </div>
      )}

      {showSettings && (
        <SettingsModal settings={settings} onSave={persistSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
