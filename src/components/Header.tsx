'use client';
import Link from 'next/link';
import { CouncilSession } from '@/types';

interface Props {
  session: CouncilSession | null;
  isRunning: boolean;
}

const STATUS_LABEL: Record<string, { text: string; color: string; dot: string }> = {
  discussing: { text: '讨论中...', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  synthesizing: { text: '主持人综合中...', color: 'text-purple-400', dot: 'bg-purple-400 animate-pulse' },
  done: { text: '决议完成', color: 'text-emerald-400', dot: 'bg-emerald-400' },
};

export default function Header({ session, isRunning }: Props) {
  const status = session ? STATUS_LABEL[session.status] : null;

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06] bg-[#0e1220] shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚖️</span>
        <span className="font-semibold text-white tracking-wide">AI 决议会</span>
        <span className="text-xs text-gray-500 ml-1">Council</span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/negotiation"
          className="text-xs px-3 py-1.5 rounded-lg border border-amber-300/30 bg-amber-300/[0.08] text-amber-200 hover:bg-amber-300/[0.16] transition-all"
        >
          🎴 谈薪模拟器
        </Link>
        {status && (
          <div className={`flex items-center gap-2 text-sm ${status.color}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.text}
          </div>
        )}
        {!isRunning && !session && (
          <span className="text-xs text-gray-600">配置 API Key 后输入议题开始</span>
        )}
      </div>
    </header>
  );
}
