'use client';
import { useState, KeyboardEvent } from 'react';
import { Agent } from '@/types';

interface Props {
  onStart: (topic: string) => void;
  disabled: boolean;
  agents: Agent[];
}

export default function TopicBar({ onStart, disabled, agents }: Props) {
  const [topic, setTopic] = useState('');

  const readyCount = agents.filter((a) => a.enabled && a.apiKey).length;
  const canStart = !disabled && topic.trim().length > 0 && readyCount > 0;

  const handleStart = () => {
    if (!canStart) return;
    onStart(topic.trim());
    setTopic('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleStart();
    }
  };

  return (
    <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0e1220]">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="输入议题或任务，例如：如何在 2025 年打造一款 AI 教育产品？"
            rows={2}
            className="w-full resize-none bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-white/20 disabled:cursor-not-allowed leading-relaxed"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-gray-700">
            ⌘↵ 发起
          </span>
        </div>
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            canStart
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {disabled ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              决议中
            </span>
          ) : (
            '发起决议'
          )}
        </button>
      </div>

      {readyCount === 0 && !disabled && (
        <p className="mt-2 text-xs text-amber-500/80">
          ⚠️ 请先在左侧为至少一个 Agent 配置 API Key
        </p>
      )}
      {readyCount > 0 && !disabled && (
        <p className="mt-2 text-xs text-gray-600">
          {readyCount} 个 Agent 就绪 · 发言顺序：战略家 → 批判者 → 创新者 → 执行者 → 主持人综合
        </p>
      )}
    </div>
  );
}
