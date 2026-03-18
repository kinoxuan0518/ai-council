'use client';
import { useEffect, useRef } from 'react';
import { CouncilSession } from '@/types';
import MessageBubble from './MessageBubble';

interface Props {
  session: CouncilSession | null;
}

export default function CouncilChat({ session }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages.length, session?.messages.at(-1)?.content.length]);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none">
        <div className="text-5xl mb-4 opacity-20">⚖️</div>
        <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
          配置好左侧各 Agent 的 API Key，然后在上方输入议题，
          <br />
          多个 AI 模型将协作产出一份完整决议方案。
        </p>
        <div className="mt-6 flex items-center gap-4 text-xs text-gray-700">
          {['🎯 战略', '🔍 批判', '💡 创新', '⚡ 执行', '⚖️ 综合'].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Topic banner */}
      <div className="mb-5 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
        <span className="text-indigo-500 font-medium mr-2">议题</span>
        {session.topic}
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4">
        {session.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Done state */}
      {session.status === 'done' && (
        <div className="mt-6 text-center text-xs text-gray-600 py-3 border-t border-white/[0.04]">
          ✦ 决议完成 · 共 {session.messages.length} 条发言
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
