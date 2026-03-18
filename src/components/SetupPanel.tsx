'use client';
import { Agent } from '@/types';
import AgentConfigCard from './AgentConfigCard';

interface Props {
  agents: Agent[];
  onSave: (agents: Agent[]) => void;
  disabled: boolean;
}

export default function SetupPanel({ agents, onSave, disabled }: Props) {
  const handleChange = (updated: Agent) => {
    onSave(agents.map((a) => (a.id === updated.id ? updated : a)));
  };

  const configured = agents.filter((a) => a.apiKey && a.enabled).length;
  const total = agents.filter((a) => a.enabled).length;

  return (
    <aside className="w-[300px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0e1220] overflow-hidden">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">成员配置</span>
          <span className="text-xs text-gray-500">
            {configured}/{total} 已就绪
          </span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: total > 0 ? `${(configured / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Agent cards */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {agents.map((agent) => (
          <AgentConfigCard
            key={agent.id}
            agent={agent}
            onChange={handleChange}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          每家模型厂商需单独申请 API Key。配置后点击开始，各 Agent 将依次发言，最终由主持人综合输出决议。
        </p>
      </div>
    </aside>
  );
}
