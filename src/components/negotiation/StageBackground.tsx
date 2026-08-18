'use client';

// 谈判场景：优先使用即梦生成的背景图（public/negotiation/bg-{mood}.webp），
// 缺失时回退到内置 SVG 场景。
// mood: warm=傍晚暖光(HR主场) / cool=清晨冷调(候选人主场)

import { useState } from 'react';

export default function StageBackground({ mood = 'warm' }: { mood?: 'warm' | 'cool' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const wallTop = mood === 'warm' ? '#2e2334' : '#1d2733';
  const wallBottom = mood === 'warm' ? '#4a3547' : '#314352';
  const skyTop = mood === 'warm' ? '#8a4a6b' : '#7fa8c9';
  const skyBottom = mood === 'warm' ? '#e8965a' : '#d9e8f2';
  const glow = mood === 'warm' ? '#ffcf8f' : '#cfe6f5';
  const tableTop = mood === 'warm' ? '#5d4233' : '#3b4d5c';
  const tableFront = mood === 'warm' ? '#43301f' : '#2b3a46';

  if (!imgFailed) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/negotiation/bg-${mood}.webp`}
          alt=""
          draggable={false}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
        {/* 顶部与底部渐变，保证 UI 可读性 */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>
    );
  }

  return (
    <svg viewBox="0 0 960 540" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wallTop} />
          <stop offset="1" stopColor={wallBottom} />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor={glow} stopOpacity="0.5" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tableSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* 墙面 */}
      <rect x="0" y="0" width="960" height="540" fill="url(#wall)" />
      {/* 吊灯光晕 */}
      <rect x="180" y="0" width="600" height="380" fill="url(#lampGlow)" />

      {/* 落地窗 */}
      <g>
        <rect x="80" y="60" width="520" height="330" rx="6" fill="#151221" />
        <rect x="88" y="68" width="504" height="314" fill="url(#sky)" />
        {/* 远处城市天际线 */}
        <g fill="#00000055">
          <rect x="100" y="240" width="36" height="142" />
          <rect x="144" y="200" width="26" height="182" />
          <rect x="178" y="260" width="44" height="122" />
          <rect x="230" y="180" width="30" height="202" />
          <rect x="268" y="230" width="52" height="152" />
          <rect x="328" y="205" width="28" height="177" />
          <rect x="364" y="250" width="40" height="132" />
          <rect x="412" y="190" width="34" height="192" />
          <rect x="454" y="245" width="46" height="137" />
          <rect x="508" y="215" width="30" height="167" />
          <rect x="546" y="255" width="38" height="127" />
        </g>
        {/* 楼宇灯火 */}
        <g fill={mood === 'warm' ? '#ffe9b0' : '#eaf6ff'}>
          {[
            [108, 250], [114, 262], [122, 250], [150, 212], [156, 240],
            [186, 272], [198, 286], [238, 196], [246, 220], [252, 196],
            [278, 244], [292, 260], [306, 244], [334, 218], [344, 244],
            [372, 262], [386, 276], [420, 202], [430, 228], [462, 258],
            [476, 272], [516, 228], [526, 252], [554, 268], [566, 282],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="7" opacity={0.5 + ((i * 7) % 5) * 0.1} />
          ))}
        </g>
        {/* 窗框 */}
        <g stroke="#2a2233" strokeWidth="8" fill="none">
          <rect x="84" y="64" width="512" height="322" rx="4" />
          <path d="M340 64 L340 386 M180 64 L180 386 M500 64 L500 386" />
          <path d="M84 200 L596 200" />
        </g>
      </g>

      {/* 挂钟 */}
      <g transform="translate(760 120)">
        <circle r="38" fill="#f5f1e6" stroke="#3a2f2a" strokeWidth="5" />
        <path d="M0 0 L0 -24 M0 0 L16 6" stroke="#3a2f2a" strokeWidth="4" strokeLinecap="round" />
        <circle r="3.5" fill="#3a2f2a" />
        <circle r="30" fill="none" stroke="#00000022" strokeWidth="2" />
      </g>

      {/* 绿植 */}
      <g transform="translate(880 300)">
        <path d="M-26 20 Q-30 -70 0 -110 Q30 -70 26 20 Q0 34 -26 20 Z" fill="#2f5d43" />
        <path d="M-20 14 Q-24 -60 0 -96 Q24 -60 20 14 Q0 26 -20 14 Z" fill="#3d7354" />
        <path d="M-12 -20 Q-6 -60 8 -76 Q10 -40 -2 -16 Z" fill="#4d8a63" opacity="0.7" />
        <path d="M-34 22 L34 22 L28 66 L-28 66 Z" fill="#8a5a3a" />
        <path d="M-34 22 L0 30 L34 22 L30 34 L-30 34 Z" fill="#9c6a46" />
      </g>

      {/* 会议桌（前景） */}
      <g>
        <path d="M-40 460 L140 360 L820 360 L1000 460 L1000 560 L-40 560 Z" fill={tableTop} />
        <path d="M-40 460 L140 360 L820 360 L1000 460 L1000 478 L-40 578 Z" fill={tableFront} />
        <path d="M-40 460 L140 360 L820 360 L1000 460 L1000 470 L-40 570 Z" fill="url(#tableSheen)" />
        {/* 桌面反光 */}
        <path d="M220 420 L700 378 L760 382 L280 428 Z" fill="#ffffff" opacity="0.06" />
        {/* 笔记本电脑 */}
        <g transform="translate(170 388) skewX(-14)">
          <path d="M0 0 L86 0 L86 52 L0 52 Z" fill="#20242c" />
          <path d="M4 4 L82 4 L82 48 L4 48 Z" fill="#3d5a80" />
          <path d="M6 6 L80 6 L80 30 Q44 40 6 32 Z" fill="#5d82ad" opacity="0.5" />
          <path d="M-10 52 L96 52 L96 58 L-10 58 Z" fill="#39404c" />
        </g>
        {/* 咖啡杯 ×2 */}
        <g transform="translate(420 396)">
          <ellipse cx="0" cy="14" rx="16" ry="5" fill="#00000033" />
          <path d="M-13 0 L13 0 L11 14 L-11 14 Z" fill="#e8e2d6" />
          <path d="M13 3 Q22 5 20 10 Q18 14 12 12" stroke="#e8e2d6" strokeWidth="3" fill="none" />
          <ellipse cx="0" cy="1" rx="11" ry="3.4" fill="#5a3d28" />
          <path d="M-4 -1 Q0 -4 4 -1" stroke="#b9987899" strokeWidth="1.6" fill="none" className="steam" />
        </g>
        <g transform="translate(560 404)">
          <ellipse cx="0" cy="13" rx="14" ry="4.6" fill="#00000033" />
          <path d="M-11 0 L11 0 L9.5 13 L-9.5 13 Z" fill="#d9d2c4" />
          <ellipse cx="0" cy="1" rx="9.4" ry="3" fill="#5a3d28" />
          <path d="M-3 -1 Q0 -3.6 3 -1" stroke="#b9987888" strokeWidth="1.4" fill="none" className="steam" />
        </g>
        {/* 文件与笔 */}
        <g transform="translate(700 408) rotate(-6)">
          <rect x="0" y="0" width="58" height="40" rx="2" fill="#f2ecdd" />
          <rect x="6" y="7" width="34" height="3.4" rx="1.6" fill="#b9b19d" />
          <rect x="6" y="15" width="44" height="3" rx="1.5" fill="#c9c2ad" />
          <rect x="6" y="22" width="40" height="3" rx="1.5" fill="#c9c2ad" />
          <rect x="6" y="29" width="26" height="3" rx="1.5" fill="#d5cebb" />
          <rect x="50" y="18" width="26" height="4" rx="2" fill="#2e4166" transform="rotate(24 50 18)" />
        </g>
      </g>

      {/* 漂浮光尘 */}
      <g fill={glow}>
        <circle cx="300" cy="180" r="2.2" className="dust dust-a" opacity="0.5" />
        <circle cx="520" cy="130" r="1.6" className="dust dust-b" opacity="0.4" />
        <circle cx="640" cy="240" r="2.6" className="dust dust-c" opacity="0.35" />
        <circle cx="200" cy="260" r="1.8" className="dust dust-b" opacity="0.3" />
        <circle cx="450" cy="300" r="2" className="dust dust-a" opacity="0.3" />
      </g>
    </svg>
  );
}
