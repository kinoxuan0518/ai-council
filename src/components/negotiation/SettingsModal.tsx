'use client';

import { useState } from 'react';
import { PROVIDER_CONFIG } from '@/lib/providers';
import { GameSettings } from '@/lib/negotiation';

interface Props {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<GameSettings>(settings);
  const providers = Object.entries(PROVIDER_CONFIG);
  const models = draft.provider && PROVIDER_CONFIG[draft.provider as keyof typeof PROVIDER_CONFIG]
    ? PROVIDER_CONFIG[draft.provider as keyof typeof PROVIDER_CONFIG].models
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[440px] max-w-[92vw] rounded-2xl border border-white/[0.12] bg-[#10141f] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-100">⚙️ 游戏设置</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">✕</button>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="text-xs text-gray-400">大模型供应商（扮演对方角色）</span>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {providers.map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setDraft({ ...draft, provider: key, model: cfg.models[0].id })}
                  className={`rounded-lg border px-2 py-2 text-xs transition-all ${
                    draft.provider === key ? 'border-blue-400/60 bg-blue-400/10 text-blue-200' : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25'
                  }`}
                >
                  <span className="mr-1">{cfg.badge}</span>{cfg.name}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">模型</span>
            <select
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              className="mt-1 w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-400/50"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#10141f]">{m.name}（{m.id}）</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">API Key（仅保存在本机浏览器）</span>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-…"
              className="mt-1 w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-blue-400/50"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setDraft({ ...draft, ttsEnabled: !draft.ttsEnabled })}
              className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                draft.ttsEnabled ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200' : 'border-white/10 text-gray-500'
              }`}
            >
              {draft.ttsEnabled ? '🔊 语音朗读：开' : '🔇 语音朗读：关'}
            </button>
            <button
              onClick={() => setDraft({ ...draft, voiceAutoSend: !draft.voiceAutoSend })}
              className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                draft.voiceAutoSend ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200' : 'border-white/10 text-gray-500'
              }`}
            >
              {draft.voiceAutoSend ? '⏩ 语音自动发送：开' : '✍️ 语音自动发送：关'}
            </button>
          </div>
        </div>

        <button
          onClick={() => { onSave(draft); onClose(); }}
          className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-400 to-violet-400 text-[#10121a] font-semibold text-sm hover:brightness-110 transition-all"
        >
          保存
        </button>
      </div>
    </div>
  );
}
