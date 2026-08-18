'use client';

import { Expression, EXPRESSION_BADGE } from '@/lib/negotiation';

interface Props {
  name: string;
  title: string;
  text: string;
  streaming: boolean;
  thinking: boolean;
  expression: Expression;
  action?: string;
  playerSide?: 'left' | 'right';
}

export default function DialogueBox({ name, title, text, streaming, thinking, expression, action }: Props) {
  const badge = EXPRESSION_BADGE[expression];

  return (
    <div className="relative mx-4 mb-2 rounded-2xl border border-white/[0.12] bg-[#0c0f1a]/85 backdrop-blur-md shadow-[0_10px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* 名牌 */}
      <div className="absolute -top-4 left-6 flex items-center gap-2">
        <div className="rounded-lg bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-1.5 shadow-lg">
          <span className="text-sm font-bold text-[#1c1410]">{name}</span>
          <span className="text-[10px] text-[#1c1410]/70 ml-1.5">{title}</span>
        </div>
        <div className="rounded-full bg-[#0c0f1a]/90 border border-white/10 px-2.5 py-1 text-[11px] text-gray-300 animate-fade-in">
          {badge.emoji} {badge.label}
        </div>
      </div>

      <div className="px-6 pt-8 pb-5 min-h-[104px] flex flex-col justify-center">
        {action && !thinking && (
          <div className="text-[12px] italic text-teal-200/70 mb-1.5 animate-fade-in">（{action}）</div>
        )}
        {thinking ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm h-8">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            {name}正在斟酌措辞…
          </div>
        ) : (
          <p className="text-[17px] leading-relaxed text-gray-100 font-serif tracking-wide">
            {text}
            {streaming && <span className="inline-block w-[2px] h-[18px] bg-amber-300 ml-0.5 align-middle animate-cursor-blink" />}
          </p>
        )}
      </div>
    </div>
  );
}
