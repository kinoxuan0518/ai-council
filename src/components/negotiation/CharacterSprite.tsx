'use client';

// 视觉小说立绘：优先使用即梦生成的 PNG 立绘（public/negotiation/char-*.png），
// 图片缺失或加载失败时自动回退到内置手绘 SVG（7 表情系统）。

import { useState } from 'react';
import { CharacterVariant, EXPRESSION_BADGE, Expression } from '@/lib/negotiation';

interface Palette {
  hair: string;
  hairHi: string;
  skin: string;
  skinShade: string;
  blazer: string;
  blazerDark: string;
  shirt: string;
  accent: string;
  eye: string;
}

const PALETTES: Record<CharacterVariant, Palette> = {
  candidateF: {
    hair: '#4a342a', hairHi: '#6d4c3a', skin: '#ffe4d2', skinShade: '#f4c8ab',
    blazer: '#2e4166', blazerDark: '#243352', shirt: '#f7ecdc', accent: '#d4836f', eye: '#7c5a3e',
  },
  candidateM: {
    hair: '#2c2c34', hairHi: '#474752', skin: '#ffdfc8', skinShade: '#f2c2a2',
    blazer: '#41605f', blazerDark: '#334c4c', shirt: '#ffffff', accent: '#4a7a9d', eye: '#3d4f6d',
  },
  hrF: {
    hair: '#2a2430', hairHi: '#463b50', skin: '#ffe6d4', skinShade: '#f4cbad',
    blazer: '#23232c', blazerDark: '#191920', shirt: '#f8f8f5', accent: '#b8434e', eye: '#5b4a68',
  },
  hrM: {
    hair: '#3b2f26', hairHi: '#594739', skin: '#ffdcc2', skinShade: '#efbd9b',
    blazer: '#5f4b38', blazerDark: '#4b3b2c', shirt: '#f4f0e8', accent: '#8a3324', eye: '#4a3a28',
  },
};

const FEMALE: Record<CharacterVariant, boolean> = {
  candidateF: true, candidateM: false, hrF: true, hrM: false,
};

function Eye({
  cx, cy, w, h, palette, expression,
}: {
  cx: number; cy: number; w: number; h: number; palette: Palette; expression: Expression;
}) {
  const iris = (dx: number, dy: number, r: number, lid = 0) => (
    <g clipPath="none">
      <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} fill="#fff" />
      {lid > 0 && (
        <path
          d={`M${cx - w / 2} ${cy - h / 2 + lid} Q${cx} ${cy - h / 2 - lid * 0.3} ${cx + w / 2} ${cy - h / 2 + lid} L${cx + w / 2} ${cy - h / 2} L${cx - w / 2} ${cy - h / 2} Z`}
          fill={palette.skinShade}
          opacity="0.9"
        />
      )}
      <circle cx={cx + dx} cy={cy + dy} r={r} fill={palette.eye} />
      <circle cx={cx + dx} cy={cy + dy} r={r * 0.45} fill="#1c1410" />
      <circle cx={cx + dx - r * 0.35} cy={cy + dy - r * 0.4} r={r * 0.22} fill="#fff" opacity="0.95" />
      <path
        d={`M${cx - w / 2} ${cy - h / 2 + 1} Q${cx} ${cy - h / 2 - 3} ${cx + w / 2} ${cy - h / 2 + 1}`}
        stroke="#2b2018" strokeWidth="3.4" strokeLinecap="round" fill="none"
      />
      <path
        d={`M${cx - w / 2 + 2} ${cy + h / 2 - 1} Q${cx} ${cy + h / 2 + 1.5} ${cx + w / 2 - 2} ${cy + h / 2 - 1}`}
        stroke="#8a6a56" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7"
      />
    </g>
  );

  switch (expression) {
    case 'happy':
      return (
        <path
          d={`M${cx - w / 2} ${cy + 2} Q${cx} ${cy - h} ${cx + w / 2} ${cy + 2}`}
          stroke="#2b2018" strokeWidth="4" strokeLinecap="round" fill="none"
        />
      );
    case 'angry':
      return iris(0, 2, 7, 5);
    case 'thinking':
      return iris(4, 1, 7, 2);
    case 'surprised':
      return iris(0, 0, 9);
    case 'sad':
      return iris(0, 3, 7, 3);
    case 'smug':
      return iris(0, 1, 6, 6);
    default:
      return iris(0, 0, 7);
  }
}

function Brow({
  cx, cy, w, expression, mirror,
}: {
  cx: number; cy: number; w: number; expression: Expression; mirror: boolean;
}) {
  const stroke = '#3a2b21';
  const base = (
    <path
      d={`M${cx - w / 2} ${cy + 2} Q${cx} ${cy - 3} ${cx + w / 2} ${cy + 1}`}
      stroke={stroke} strokeWidth="4" strokeLinecap="round" fill="none"
    />
  );
  let transform = '';
  switch (expression) {
    case 'angry':
      transform = `rotate(${mirror ? -18 : 18} ${cx} ${cy}) translate(0 3)`;
      break;
    case 'sad':
      transform = `rotate(${mirror ? 14 : -14} ${cx} ${cy}) translate(0 -2)`;
      break;
    case 'surprised':
      transform = 'translate(0 -6)';
      break;
    case 'thinking':
      transform = mirror ? 'translate(0 -5) rotate(-8)' : 'translate(0 2)';
      break;
    case 'smug':
      transform = mirror ? 'translate(0 -3)' : 'translate(0 1)';
      break;
    case 'happy':
      transform = 'translate(0 -3)';
      break;
    default:
      transform = '';
  }
  return <g transform={transform}>{base}</g>;
}

function Mouth({ cx, cy, expression, speaking }: { cx: number; cy: number; expression: Expression; speaking: boolean }) {
  const lip = '#b0564f';
  switch (expression) {
    case 'happy':
      return (
        <g>
          <path d={`M${cx - 15} ${cy - 3} Q${cx} ${cy + 16} ${cx + 15} ${cy - 3} Q${cx} ${cy + 4} ${cx - 15} ${cy - 3} Z`} fill={lip} />
          <path d={`M${cx - 9} ${cy + 6} Q${cx} ${cy + 12} ${cx + 9} ${cy + 6} Z`} fill="#e2837a" />
        </g>
      );
    case 'angry':
      return <path d={`M${cx - 13} ${cy + 7} Q${cx} ${cy - 4} ${cx + 13} ${cy + 7}`} stroke={lip} strokeWidth="3.6" strokeLinecap="round" fill="none" />;
    case 'surprised':
      return <ellipse cx={cx} cy={cy + 3} rx="7" ry="9" fill={lip} />;
    case 'sad':
      return <path d={`M${cx - 12} ${cy + 6} Q${cx} ${cy - 1} ${cx + 12} ${cy + 6}`} stroke={lip} strokeWidth="3.2" strokeLinecap="round" fill="none" />;
    case 'thinking':
      return <path d={`M${cx - 10} ${cy + 3} L${cx + 11} ${cy}`} stroke={lip} strokeWidth="3.2" strokeLinecap="round" fill="none" />;
    case 'smug':
      return <path d={`M${cx - 13} ${cy + 1} Q${cx + 2} ${cy + 9} ${cx + 13} ${cy - 5}`} stroke={lip} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    default:
      return speaking ? (
        <ellipse className="mouth-talk" cx={cx} cy={cy + 2} rx="8" ry="6" fill={lip} style={{ transformOrigin: `${cx}px ${cy + 2}px` }} />
      ) : (
        <path d={`M${cx - 11} ${cy + 2} Q${cx} ${cy + 6} ${cx + 11} ${cy + 2}`} stroke={lip} strokeWidth="3" strokeLinecap="round" fill="none" />
      );
  }
}

function Hair({ variant, palette }: { variant: CharacterVariant; palette: Palette }) {
  if (FEMALE[variant]) {
    const long = variant === 'candidateF';
    return (
      <g>
        <path
          d={long
            ? 'M96 150 Q92 62 160 54 Q228 62 224 150 L238 300 Q240 330 218 334 Q206 336 204 318 L198 240 Q160 252 122 240 L116 318 Q114 336 102 334 Q80 330 82 300 Z'
            : 'M100 148 Q96 64 160 56 Q224 64 220 148 L228 272 Q228 296 204 296 L112 296 Q92 296 92 272 Z'}
          fill={palette.hair}
        />
        <path
          d={long ? 'M100 120 Q108 76 150 64 Q120 84 112 130 Z' : 'M104 118 Q112 76 148 64 Q122 84 114 126 Z'}
          fill={palette.hairHi} opacity="0.55"
        />
        <path
          d="M108 152 Q106 82 160 76 Q214 82 212 152 Q208 116 192 104 Q176 92 158 102 Q150 88 130 98 Q112 108 108 152 Z"
          fill={palette.hair}
        />
        <path d="M148 84 Q136 96 130 118 Q140 102 152 94 Z" fill={palette.hairHi} opacity="0.5" />
        <path d="M186 88 Q196 100 200 124 Q192 104 180 94 Z" fill={palette.hairHi} opacity="0.4" />
      </g>
    );
  }
  return (
    <g>
      <path
        d="M106 150 Q104 72 160 66 Q216 72 214 150 Q212 108 196 96 Q184 86 160 92 Q136 86 124 96 Q108 108 106 150 Z"
        fill={palette.hair}
      />
      <path d="M118 100 Q134 80 160 78 Q140 86 126 104 Z" fill={palette.hairHi} opacity="0.5" />
      <path d="M108 148 L112 186 L104 150 Z" fill={palette.hair} />
      <path d="M212 148 L208 186 L216 150 Z" fill={palette.hair} />
    </g>
  );
}

function Extras({ variant, palette }: { variant: CharacterVariant; palette: Palette }) {
  switch (variant) {
    case 'candidateF':
      return (
        <g>
          <circle cx="112" cy="182" r="4" fill="#e8b64c" />
          <circle cx="208" cy="182" r="4" fill="#e8b64c" />
        </g>
      );
    case 'candidateM':
      return (
        <g stroke="#3d4148" strokeWidth="2.6" fill="none">
          <circle cx="138" cy="158" r="19" />
          <circle cx="182" cy="158" r="19" />
          <path d="M157 156 Q160 160 163 156" />
          <path d="M119 154 L106 150" />
          <path d="M201 154 L214 150" />
        </g>
      );
    case 'hrF':
      return (
        <g>
          <path d="M138 262 L152 320 M182 262 L168 320" stroke={palette.accent} strokeWidth="4" fill="none" />
          <rect x="146" y="318" width="28" height="38" rx="3" fill="#e8e6df" stroke="#c8c4b8" strokeWidth="1.5" />
          <rect x="151" y="324" width="18" height="5" rx="2" fill="#9aa0a8" />
          <rect x="151" y="333" width="18" height="3" rx="1.5" fill="#c5c9cf" />
          <rect x="151" y="340" width="12" height="3" rx="1.5" fill="#c5c9cf" />
        </g>
      );
    default:
      return (
        <g>
          <g stroke="#4d4237" strokeWidth="2.6" fill="none">
            <rect x="121" y="143" width="34" height="24" rx="5" />
            <rect x="165" y="143" width="34" height="24" rx="5" />
            <path d="M155 154 Q160 158 165 154" />
            <path d="M121 152 L110 149" />
            <path d="M199 152 L210 149" />
          </g>
          <path d="M160 268 L172 282 L160 292 L148 282 Z" fill={palette.accent} />
          <path d="M160 292 L174 316 L160 372 L146 316 Z" fill={palette.accent} />
          <path d="M160 292 L174 316 L160 330 Z" fill="#00000022" />
        </g>
      );
  }
}

function SvgSprite({
  variant, expression, speaking, className,
}: {
  variant: CharacterVariant; expression: Expression; speaking: boolean; className?: string;
}) {
  const palette = PALETTES[variant];
  const female = FEMALE[variant];
  const eyeW = female ? 27 : 24;
  const eyeH = female ? 17 : 14;

  const blushOpacity =
    expression === 'happy' ? 0.55 :
    expression === 'angry' ? 0.4 :
    expression === 'sad' ? 0.28 :
    expression === 'smug' ? 0.22 : 0;

  return (
    <svg viewBox="0 0 320 440" className={className} style={{ overflow: 'visible' }}>
      <g>
        <Hair variant={variant} palette={palette} />
        <path d="M142 218 L178 218 L178 258 Q160 268 142 258 Z" fill={palette.skinShade} />
        <path
          d="M60 440 Q66 340 98 300 Q120 274 142 262 L160 286 L178 262 Q200 274 222 300 Q254 340 260 440 Z"
          fill={palette.blazer}
        />
        <path d="M138 262 L160 300 L182 262 L192 270 L160 322 L128 270 Z" fill={palette.shirt} />
        <path d="M142 258 L160 292 L178 258 Q168 276 160 276 Q152 276 142 258 Z" fill={palette.shirt} />
        <path d="M138 262 L160 300 L150 262 Z" fill={palette.blazerDark} />
        <path d="M182 262 L160 300 L170 262 Z" fill={palette.blazerDark} />
        <path d="M112 152 Q112 86 160 82 Q208 86 208 152 Q208 198 187 222 Q173 238 160 238 Q147 238 133 222 Q112 198 112 152 Z" fill={palette.skin} />
        <ellipse cx="112" cy="168" rx="7" ry="11" fill={palette.skin} />
        <ellipse cx="208" cy="168" rx="7" ry="11" fill={palette.skin} />
        <path d="M208 152 Q208 198 187 222 Q200 196 204 156 Z" fill={palette.skinShade} opacity="0.35" />
        <Hair variant={variant} palette={palette} />
        <g>
          <Brow cx={138} cy={130} w={26} expression={expression} mirror={false} />
          <Brow cx={182} cy={130} w={26} expression={expression} mirror={true} />
          <Eye cx={138} cy={158} w={eyeW} h={eyeH} palette={palette} expression={expression} />
          <Eye cx={182} cy={158} w={eyeW} h={eyeH} palette={palette} expression={expression} />
          <path d="M160 176 Q163 182 158 184" stroke={palette.skinShade} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <Mouth cx={160} cy={202} expression={expression} speaking={speaking} />
          <ellipse cx={127} cy={184} rx="11" ry="6" fill="#f79a94" opacity={blushOpacity} />
          <ellipse cx={193} cy={184} rx="11" ry="6" fill="#f79a94" opacity={blushOpacity} />
        </g>
        <Extras variant={variant} palette={palette} />
        {expression === 'angry' && (
          <g stroke="#e0455f" strokeWidth="3.4" strokeLinecap="round" className="sprite-pop">
            <path d="M216 96 L228 84 M228 96 L216 84 M234 104 L246 92 M246 104 L234 92" />
          </g>
        )}
        {(expression === 'surprised' || expression === 'sad') && (
          <path d="M214 104 Q220 118 226 104 Q226 96 220 96 Q214 96 214 104 Z" fill="#9adcf0" opacity="0.9" className="sprite-pop" />
        )}
        {expression === 'thinking' && (
          <g fill="#e8e4da" className="sprite-pop">
            <circle cx="230" cy="88" r="4" opacity="0.9" />
            <circle cx="242" cy="74" r="6" opacity="0.7" />
            <circle cx="258" cy="56" r="8" opacity="0.5" />
          </g>
        )}
        {expression === 'happy' && (
          <g className="sprite-hearts" fill="#ff7b9c">
            <path d="M236 108 c0-6 9-6 9 0 c0-6 9-6 9 0 c0 7-9 12-9 16 c0-4-9-9-9-16 Z" opacity="0.9" />
            <path d="M252 74 c0-4 6-4 6 0 c0-4 6-4 6 0 c0 5-6 8-6 11 c0-3-6-6-6-11 Z" opacity="0.6" />
          </g>
        )}
      </g>
    </svg>
  );
}

const BODY_ANIM: Record<string, string> = {
  neutral: 'sprite-idle',
  happy: 'sprite-happy',
  angry: 'sprite-angry',
  thinking: 'sprite-think',
  surprised: 'sprite-idle',
  sad: 'sprite-idle',
  smug: 'sprite-idle',
};

export default function CharacterSprite({
  variant, expression, speaking = false, className = '',
}: {
  variant: CharacterVariant;
  expression: Expression;
  speaking?: boolean;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const anim = BODY_ANIM[expression] ?? 'sprite-idle';
  const badge = EXPRESSION_BADGE[expression];

  if (!imgFailed) {
    return (
      <div className={`relative ${className}`} style={{ transformOrigin: 'center bottom' }}>
        <div className={`w-full h-full ${anim}`} style={{ transformOrigin: 'center bottom' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/negotiation/char-${variant}.png`}
            alt=""
            draggable={false}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
          />
        </div>
        {expression !== 'neutral' && (
          <span key={expression} className="absolute right-[6%] top-[4%] text-4xl sprite-pop select-none">
            {badge.emoji}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full h-full ${anim}`} style={{ transformOrigin: '160px 400px' }}>
        <SvgSprite variant={variant} expression={expression} speaking={speaking} className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]" />
      </div>
    </div>
  );
}
