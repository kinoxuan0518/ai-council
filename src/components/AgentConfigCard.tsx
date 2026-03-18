'use client';
import { useState } from 'react';
import { Agent, Provider } from '@/types';
import { PROVIDER_CONFIG, ROLE_CONFIG } from '@/lib/providers';

interface Props {
  agent: Agent;
  onChange: (updated: Agent) => void;
  disabled: boolean;
}

const PROVIDERS = Object.keys(PROVIDER_CONFIG) as Provider[];

export default function AgentConfigCard({ agent, onChange, disabled }: Props) {
  const [showKey, setShowKey] = useState(false);
  const role = ROLE_CONFIG[agent.role];
  const providerCfg = PROVIDER_CONFIG[agent.provider];

  const update = (patch: Partial<Agent>) => onChange({ ...agent, ...patch });

  const handleProviderChange = (p: Provider) => {
    const defaultModel = PROVIDER_CONFIG[p].models[0].id;
    update({ provider: p, model: defaultModel, color: PROVIDER_CONFIG[p].color });
  };

  return (
    <div
      className="rounded-xl border bg-[#111827] p-4 flex flex-col gap-3 transition-opacity"
      style={{
        borderColor: agent.enabled ? `${agent.color}40` : '#1f2937',
        opacity: agent.enabled ? 1 : 0.5,
      }}
    >
      {/* Top row: avatar + name + toggle */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: `${agent.color}22` }}
        >
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white text-sm truncate">{agent.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: `${agent.color}22`, color: agent.color }}
            >
              {role.label}
            </span>
            <span className="text-[10px] text-gray-500">{role.description}</span>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => update({ enabled: !agent.enabled })}
          disabled={disabled}
          className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${
            agent.enabled ? 'bg-emerald-500' : 'bg-gray-700'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              agent.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Provider selector */}
      <div className="flex gap-2">
        {PROVIDERS.map((p) => {
          const cfg = PROVIDER_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() => handleProviderChange(p)}
              disabled={disabled}
              title={cfg.name}
              className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                agent.provider === p
                  ? 'border-current text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={
                agent.provider === p
                  ? { color: cfg.color, backgroundColor: `${cfg.color}18`, borderColor: `${cfg.color}60` }
                  : {}
              }
            >
              {cfg.badge}
            </button>
          );
        })}
      </div>

      {/* Provider name + model select */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500">{providerCfg.name}</span>
          <span className="text-[11px]" style={{ color: providerCfg.color }}>
            {providerCfg.badge} {providerCfg.nameEn}
          </span>
        </div>
        <select
          value={agent.model}
          onChange={(e) => update({ model: e.target.value })}
          disabled={disabled}
          className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-white/20 disabled:cursor-not-allowed"
        >
          {providerCfg.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* API Key input */}
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={agent.apiKey}
          onChange={(e) => update({ apiKey: e.target.value })}
          disabled={disabled}
          placeholder="API Key"
          className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-2.5 py-1.5 pr-8 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 disabled:cursor-not-allowed font-mono"
        />
        <button
          type="button"
          onClick={() => setShowKey((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
        >
          {showKey ? '🙈' : '👁'}
        </button>
      </div>

      {/* Key status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${agent.apiKey ? 'bg-emerald-400' : 'bg-gray-700'}`}
        />
        <span className="text-[10px] text-gray-600">
          {agent.apiKey ? 'Key 已配置' : '未配置 API Key'}
        </span>
      </div>
    </div>
  );
}
