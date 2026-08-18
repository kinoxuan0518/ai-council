'use client';

// 谈判复盘报告（流式渲染，markdown-lite）

import { ReactNode } from 'react';

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // **bold** 内联
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={`${keyPrefix}-${i}`} className="text-amber-200 font-semibold">{p.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{p}</span>
    )
  );
}

export function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (t.startsWith('## '))
          return (
            <h3 key={i} className="text-base font-bold text-amber-200 pt-4 pb-1 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-300 to-orange-400" />
              {t.slice(3)}
            </h3>
          );
        if (t.startsWith('### '))
          return <h4 key={i} className="text-sm font-semibold text-gray-200 pt-2">{t.slice(4)}</h4>;
        if (/^[-*•]\s/.test(t))
          return (
            <div key={i} className="flex gap-2 text-sm text-gray-300 leading-relaxed pl-2">
              <span className="text-amber-300/70 shrink-0">▪</span>
              <span>{renderInline(t.replace(/^[-*•]\s/, ''), `l${i}`)}</span>
            </div>
          );
        if (/^\d+\.\s/.test(t))
          return (
            <div key={i} className="flex gap-2 text-sm text-gray-300 leading-relaxed pl-2">
              <span className="text-amber-300/70 shrink-0">{t.match(/^\d+/)?.[0]}.</span>
              <span>{renderInline(t.replace(/^\d+\.\s/, ''), `n${i}`)}</span>
            </div>
          );
        return (
          <p key={i} className="text-sm text-gray-300 leading-relaxed">
            {renderInline(t, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}

interface Props {
  text: string;
  streaming: boolean;
  npcName: string;
  mode: 'hr' | 'candidate';
  roundsCount: number;
  onRestart: () => void;
  onBackHome: () => void;
  onOpenHistory?: () => void;
}

export default function ResultScreen({ text, streaming, npcName, mode, roundsCount, onRestart, onBackHome, onOpenHistory }: Props) {
  return (
    <div className="min-h-screen overflow-y-auto">
      {onOpenHistory && (
        <button
          onClick={onOpenHistory}
          className="fixed top-4 right-4 z-40 rounded-xl bg-black/40 backdrop-blur border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-black/60 transition-all"
        >
          📚 历史对局
        </button>
      )}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text text-transparent">
            谈判复盘报告
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            {mode === 'hr' ? `你（HR）× ${npcName}（候选人）` : `你（候选人）× ${npcName}（HR）`} · 共 {roundsCount} 轮对话
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.1] bg-[#0e1220]/80 backdrop-blur p-7 shadow-xl">
          {text ? (
            <MarkdownLite text={text} />
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-6 justify-center">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              复盘教练正在回顾整场谈判…
            </div>
          )}
          {streaming && text && (
            <span className="inline-block w-[2px] h-4 bg-amber-300 ml-1 animate-cursor-blink align-middle" />
          )}
        </div>

        {!streaming && (
          <div className="flex gap-3 mt-6 animate-fade-in">
            <button
              onClick={onRestart}
              className="flex-1 py-3 rounded-xl font-semibold text-[#1c1410] bg-gradient-to-r from-amber-200 to-orange-300 hover:brightness-110 transition-all"
            >
              🔄 再来一局
            </button>
            <button
              onClick={onBackHome}
              className="flex-1 py-3 rounded-xl font-medium text-gray-300 border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.07] transition-all"
            >
              🏠 返回设定
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
