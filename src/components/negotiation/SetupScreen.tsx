'use client';

import { CharacterVariant, DIFFICULTY_LABEL, Difficulty, GameMode, PersonaSetup, HR_MODE_PRESETS, CANDIDATE_MODE_PRESETS } from '@/lib/negotiation';
import CharacterSprite from './CharacterSprite';

interface Props {
  setup: PersonaSetup;
  onChange: (s: PersonaSetup) => void;
  onStart: () => void;
}

function Field({
  label, hint, value, onChange, rows = 2, placeholder,
}: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-300 flex items-baseline gap-2">
        {label}
        {hint && <span className="text-[10px] text-gray-500 font-normal">{hint}</span>}
      </span>
      {rows <= 2 ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-blue-400/50"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-blue-400/50 resize-none"
        />
      )}
    </label>
  );
}

export default function SetupScreen({ setup, onChange, onStart }: Props) {
  const set = (patch: Partial<PersonaSetup>) => onChange({ ...setup, ...patch });
  const presets = setup.mode === 'hr' ? HR_MODE_PRESETS : CANDIDATE_MODE_PRESETS;
  const variants: CharacterVariant[] = setup.mode === 'hr' ? ['candidateF', 'candidateM'] : ['hrF', 'hrM'];

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* 标题 */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🤝</div>
          <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text text-transparent">
            谈薪物语
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            沉浸式谈薪谈判模拟 · 打字自由对话 · Fn按住说话 · 结束生成复盘
          </p>
        </div>

        {/* 模式选择 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {([
            { mode: 'hr' as GameMode, emoji: '💼', title: '我是 HR', desc: 'AI 扮演候选人\n你输入其简历与薪资期望，说服TA接受offer' },
            { mode: 'candidate' as GameMode, emoji: '🧑‍💻', title: '我是候选人', desc: 'AI 扮演 HR\n你输入目标公司与岗位，为自己争取高薪' },
          ]).map((m) => (
            <button
              key={m.mode}
              onClick={() =>
                set({
                  mode: m.mode,
                  npcVariant: m.mode === 'hr' ? 'candidateF' : 'hrF',
                  npcName: m.mode === 'hr' ? '林晓' : '方琳',
                  npcTitle: m.mode === 'hr' ? '候选人 · 高级前端工程师' : 'HRBP · 某互联网大厂',
                })
              }
              className={`rounded-2xl border p-5 text-left transition-all ${
                setup.mode === m.mode
                  ? 'border-amber-300/60 bg-amber-300/[0.07] shadow-[0_0_30px_-10px_rgba(252,211,77,0.3)]'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="font-semibold text-gray-100">{m.title}</div>
              <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* 预设案例 */}
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-400 mb-2">🎲 快速开局（点击载入预设案例，可再修改）</div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => onChange({ ...p.setup })}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left hover:border-violet-300/40 hover:bg-violet-300/[0.05] transition-all"
              >
                <span className="text-xl shrink-0">{p.emoji}</span>
                <span>
                  <span className="block text-sm text-gray-200">{p.label}</span>
                  <span className="block text-[11px] text-gray-500">{p.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 角色形象 */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 mb-6">
          <div className="text-xs font-medium text-gray-400 mb-3">👥 对方形象（{setup.mode === 'hr' ? '候选人' : 'HR'}）</div>
          <div className="flex gap-3">
            {variants.map((v) => (
              <button
                key={v}
                onClick={() => set({ npcVariant: v })}
                className={`w-24 rounded-xl border p-2 transition-all ${
                  setup.npcVariant === v ? 'border-amber-300/60 bg-amber-300/[0.08]' : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <CharacterSprite variant={v} expression="neutral" className="w-full h-24" />
                <div className="text-[11px] text-gray-400 text-center mt-1">{v.endsWith('F') ? '♀ 女性' : '♂ 男性'}</div>
              </button>
            ))}
            <div className="flex-1 grid gap-2">
              <Field label="姓名" value={setup.npcName} onChange={(v) => set({ npcName: v })} placeholder="对方姓名" />
              <Field label="身份" value={setup.npcTitle} onChange={(v) => set({ npcTitle: v })} placeholder="如：候选人 · 高级前端工程师" />
            </div>
          </div>
        </div>

        {/* 资料表单 */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 mb-6 grid gap-4">
          <div className="text-xs font-medium text-gray-400">
            📋 {setup.mode === 'hr' ? '候选人资料（你掌握的信息）' : '公司与岗位信息（你了解到的）'}
          </div>
          {setup.mode === 'hr' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="当前薪资" value={setup.candidateCurrent || ''} onChange={(v) => set({ candidateCurrent: v })} placeholder="如 28k×16薪" />
                <Field label="期望薪资" value={setup.candidateExpect || ''} onChange={(v) => set({ candidateExpect: v })} placeholder="如 38k×16薪" />
              </div>
              <Field label="简历要点" rows={3} value={setup.resume || ''} onChange={(v) => set({ resume: v })} placeholder="背景、年限、亮点项目、离职原因…" />
              <Field label="面试记录与评价" rows={3} value={setup.interviewNotes || ''} onChange={(v) => set({ interviewNotes: v })} placeholder="面试官评价、性格观察、情绪点…" />
              <Field label="你的预算底牌" hint="对方不会知道" value={setup.hrBudget || ''} onChange={(v) => set({ hrBudget: v })} placeholder="如 30k~35k×16薪，签字费最多2万" />
            </>
          ) : (
            <>
              <Field label="公司情况" value={setup.companyInfo || ''} onChange={(v) => set({ companyInfo: v })} placeholder="公司规模、业务、风格…" />
              <Field label="岗位信息" value={setup.jobInfo || ''} onChange={(v) => set({ jobInfo: v })} placeholder="职级、base、团队、加班情况…" />
              <Field label="公司卖点" hint="HR会拿来打动你的" rows={2} value={setup.companySelling || ''} onChange={(v) => set({ companySelling: v })} placeholder="期权、WLB、平台、title…" />
              <Field label="你的情况" hint="HR已掌握的资料" rows={3} value={setup.playerResume || ''} onChange={(v) => set({ playerResume: v })} placeholder="你的年限、当前薪资、期望…" />
              <Field label="对方预算底牌" hint="戏剧参考，双方都不会说破" value={setup.hrBudgetRange || ''} onChange={(v) => set({ hrBudgetRange: v })} placeholder="如 35k~42k×16薪 + 股票" />
            </>
          )}
        </div>

        {/* 难度 */}
        <div className="mb-8">
          <div className="text-xs font-medium text-gray-400 mb-2">🎚️ 对方谈判风格</div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => {
              const info = DIFFICULTY_LABEL[d];
              return (
                <button
                  key={d}
                  onClick={() => set({ difficulty: d })}
                  className={`rounded-xl border px-3 py-2.5 text-center transition-all ${
                    setup.difficulty === d ? 'border-rose-300/50 bg-rose-300/[0.07]' : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="text-lg">{info.emoji}</div>
                  <div className="text-sm text-gray-200">{info.label}</div>
                  <div className="text-[10px] text-gray-500">{info.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-semibold text-[#1c1410] bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_8px_40px_-12px_rgba(252,211,77,0.5)]"
        >
          开始谈判 ▶
        </button>
        <p className="text-center text-[11px] text-gray-600 mt-3">全程自由打字对话 · 谈崩或成交后自动生成复盘报告</p>
      </div>
    </div>
  );
}
