'use client';
import { Message } from '@/types';
import { ROLE_CONFIG } from '@/lib/providers';

interface Props {
  message: Message;
}

/** Minimal markdown renderer: handles ##/### headers, **bold**, line breaks */
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-semibold text-white mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-white mt-4 mb-1.5">
          {line.slice(3)}
        </h2>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      // Inline bold: **text**
      const parts = line.split(/\*\*(.+?)\*\*/g);
      elements.push(
        <p key={i} className="text-sm text-gray-300 leading-relaxed">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-white font-semibold">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  });

  return elements;
}

export default function MessageBubble({ message }: Props) {
  const role = ROLE_CONFIG[message.agentRole];
  const isFinal = message.isFinal;

  return (
    <div
      className={`animate-fade-in rounded-2xl p-5 border transition-all ${
        isFinal
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-900/5'
          : 'border-white/[0.06] bg-[#111827]'
      }`}
    >
      {/* Message header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: `${message.agentColor}25` }}
        >
          {message.agentAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{message.agentName}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${message.agentColor}20`,
                color: message.agentColor,
              }}
            >
              {role?.label ?? message.agentRole}
            </span>
            {isFinal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                最终决议
              </span>
            )}
          </div>
        </div>
        {message.isStreaming && (
          <span className="text-[10px] text-gray-500 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            生成中
          </span>
        )}
      </div>

      {/* Content */}
      <div className="pl-10">
        {message.content ? (
          <div>{renderMarkdown(message.content)}</div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse [animation-delay:300ms]" />
          </div>
        )}
        {message.isStreaming && message.content && (
          <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-cursor-blink align-middle" />
        )}
      </div>
    </div>
  );
}
