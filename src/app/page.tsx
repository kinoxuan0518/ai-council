import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-rose-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-violet-400/[0.06] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-4">🎴</div>
        <h1 className="text-5xl font-bold tracking-wide bg-gradient-to-r from-amber-200 via-rose-200 to-violet-200 bg-clip-text text-transparent">
          谈薪物语
        </h1>
        <p className="text-lg text-gray-400 mt-4">
          沉浸式谈薪谈判模拟 · 大模型扮演你的对手
        </p>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          扮演 HR 说服候选人，或扮演候选人向 HR 谈薪<br />
          全程打字自由对话 · Fn 按住语音 · 谈崩帮你复盘原因，谈成帮你拆解你最在意的点
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/negotiation"
            className="px-8 py-4 rounded-2xl font-semibold text-[#1c1410] bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 hover:brightness-110 transition-all shadow-[0_8px_40px_-12px_rgba(252,211,77,0.5)]"
          >
            开始玩 ▶
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 justify-center text-xs text-gray-500">
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">💼 HR 视角</span>
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">🧑‍💻 候选人视角</span>
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">🎤 Fn 按住语音</span>
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">📊 复盘报告</span>
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">📚 历史对局</span>
        </div>
      </div>
    </div>
  );
}
