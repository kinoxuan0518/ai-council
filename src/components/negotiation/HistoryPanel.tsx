'use client';

// 历史对局面板：查看过往每局的对话记录与复盘报告（localStorage）

import { useEffect, useState } from 'react';
import { DIFFICULTY_LABEL, clearHistory, deleteGameRecord, GameRecord, loadHistory } from '@/lib/negotiation';
import { MarkdownLite } from './ResultScreen';

interface Props {
  onClose: () => void;
  refreshKey: number; // 外部变化时刷新列表
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function RecordDetail({ record, onDeleted }: { record: GameRecord; onDeleted: () => void }) {
  const [showTranscript, setShowTranscript] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-200">
          {record.mode === 'hr' ? '💼 你是HR' : '🧑‍💻 你是候选人'} · 对手 {record.npcName}（{record.npcTitle}）
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${record.outcome === 'deal' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
            {record.outcome === 'deal' ? '🤝 成交' : '💔 破裂'}
          </span>
          <button
            onClick={() => { deleteGameRecord(record.id); onDeleted(); }}
            className="text-xs text-gray-500 hover:text-rose-300"
            title="删除这条记录"
          >
            🗑
          </button>
        </div>
      </div>
      {record.endCondition && (
        <div className="text-xs text-amber-200/80 mb-2">成交条件：{record.endCondition}</div>
      )}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="text-xs text-gray-400 hover:text-gray-200 mb-2"
      >
        {showTranscript ? '▼ 收起对话记录' : `▶ 展开对话记录（${record.roundsCount} 轮）`}
      </button>
      {showTranscript && (
        <div className="max-h-64 overflow-y-auto space-y-2 mb-3 pr-1">
          {record.transcript.map((m, i) => (
            <div key={i} className={`text-sm leading-relaxed ${m.role === 'player' ? 'text-right' : ''}`}>
              <span className={`inline-block max-w-[92%] rounded-xl px-3 py-1.5 ${
                m.role === 'player' ? 'bg-blue-500/15 text-blue-100' : 'bg-white/[0.05] text-gray-200'
              }`}>
                {m.text}
                {m.action && <span className="block text-[11px] italic text-teal-200/60">（{m.action}）</span>}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-white/[0.06] pt-3">
        <MarkdownLite text={record.analysis} />
      </div>
    </div>
  );
}

export default function HistoryPanel({ onClose, refreshKey }: Props) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(loadHistory());
  }, [refreshKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[720px] max-w-[94vw] h-[80vh] rounded-2xl border border-white/[0.12] bg-[#10141f] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
          <span className="font-semibold text-gray-100">📚 历史对局（最近 {records.length} 局）</span>
          <div className="flex items-center gap-3">
            {records.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('清空全部历史对局？此操作不可恢复。')) {
                    clearHistory();
                    setRecords([]);
                    setOpenId(null);
                  }
                }}
                className="text-xs text-gray-500 hover:text-rose-300"
              >
                🗑 清空全部
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {records.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-16">
              还没有对局记录<br />
              <span className="text-xs">完成一局谈判并生成复盘报告后，会自动保存在本机浏览器</span>
            </div>
          )}
          {records.map((r) => (
            <div key={r.id}>
              <button
                onClick={() => setOpenId(openId === r.id ? null : r.id)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  openId === r.id ? 'border-amber-300/40 bg-amber-300/[0.06]' : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${r.outcome === 'deal' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                  {r.outcome === 'deal' ? '🤝' : '💔'}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-200 truncate">
                    {r.mode === 'hr' ? 'HR视角' : '候选人视角'} × {r.npcName}
                    <span className="text-gray-500 text-xs ml-2">{DIFFICULTY_LABEL[r.difficulty].label} · {r.roundsCount} 轮</span>
                  </span>
                  <span className="block text-[11px] text-gray-500">{formatDate(r.date)}</span>
                </span>
                <span className="text-gray-500 text-xs shrink-0">{openId === r.id ? '收起' : '查看'}</span>
              </button>
              {openId === r.id && (
                <div className="mt-2">
                  <RecordDetail record={r} onDeleted={() => { setRecords(loadHistory()); setOpenId(null); }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
