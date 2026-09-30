"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

export type Tier = "silver" | "gold" | "platinum";

type Metal = {
  face: string[]; // disc gradient, light → dark → light
  rim: string[]; // bevel ring, reversed so it catches light opposite the face
  edge: string;
  ink: string; // icon + text colour on the disc
  ribbon: string;
  ribbonEdge: string;
  stripe: string;
  stars: number;
};

const metals: Record<Tier, Metal> = {
  silver: {
    face: ["#fbfcfd", "#cdd3d9", "#8e97a0", "#e4e8eb"],
    rim: ["#7d868f", "#eef1f3", "#9aa2aa"],
    edge: "#6c757e",
    ink: "#3f454c",
    ribbon: "#56606b",
    ribbonEdge: "#3b434c",
    stripe: "#c9ced3",
    stars: 1,
  },
  gold: {
    face: ["#fff3d6", "#f9c46b", "#c77412", "#fbd78f"],
    rim: ["#a45a09", "#ffe7b3", "#c9800f"],
    edge: "#8f4e07",
    ink: "#5a2f03",
    ribbon: "#ff752b",
    ribbonEdge: "#c9520f",
    stripe: "#ffd2a8",
    stars: 2,
  },
  platinum: {
    face: ["#ffffff", "#e8e4f6", "#a89fc8", "#f3eefb"],
    rim: ["#6b6294", "#ffffff", "#9b91c2"],
    edge: "#574f82",
    ink: "#221a3a",
    ribbon: "#3b2f66",
    ribbonEdge: "#a89fc8",
    stripe: "#ff752b",
    stars: 3,
  },
};

const CX = 80;
const CY = 74;

/** 28-point notched rosette behind the disc. */
const rosette = (() => {
  const pts: string[] = [];
  const n = 28;
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 62 : 56.5;
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
})();

function Star({ x, y, fill }: { x: number; y: number; fill: string }) {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 4 : 1.7;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    p.push(`${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`);
  }
  return <polygon points={p.join(" ")} fill={fill} />;
}

/** Tier emblem: AI chip (automated), eye (human review), crown (senior deep-dive). */
function Emblem({ tier, color }: { tier: Tier; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (tier === "silver") {
    return (
      <g {...common}>
        <rect x="68" y="61" width="24" height="24" rx="4" />
        <rect x="74" y="67" width="12" height="12" rx="1.5" fill={color} fillOpacity="0.2" />
        {[72, 80, 88].map((v) => (
          <g key={v}>
            <path d={`M${v} 61 V56`} />
            <path d={`M${v} 85 V90`} />
            <path d={`M68 ${v - 7} H63`} />
            <path d={`M92 ${v - 7} H97`} />
          </g>
        ))}
      </g>
    );
  }
  if (tier === "gold") {
    return (
      <g {...common}>
        <path d="M60 73 C66 63 73 59 80 59 C87 59 94 63 100 73 C94 83 87 87 80 87 C73 87 66 83 60 73 Z" />
        <circle cx="80" cy="73" r="7.5" />
        <circle cx="80" cy="73" r="3" fill={color} stroke="none" />
      </g>
    );
  }
  return (
    <g {...common}>
      <path d="M63 84 L60 64 L71 72 L80 58 L89 72 L100 64 L97 84 Z" fill={color} fillOpacity="0.15" />
      <path d="M64 89 H96" />
      <circle cx="80" cy="58" r="2.2" fill={color} stroke="none" />
      <circle cx="60" cy="64" r="2" fill={color} stroke="none" />
      <circle cx="100" cy="64" r="2" fill={color} stroke="none" />
    </g>
  );
}

/** Medal badge: ribbon tails, notched rosette, bevelled metal disc, rotating inscription, tier emblem and sheen. */
export function TierBadge({ tier, size = 110 }: { tier: Tier; size?: number }) {
  const m = metals[tier];
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const label = tier.toUpperCase();

  return (
    <svg width={size} height={(size * 176) / 160} viewBox="0 0 160 176" role="img" aria-label={`${tier} audit badge`}>
      <defs>
        <linearGradient id={`${id}-face`} x1="0.15" y1="0" x2="0.85" y2="1">
          {m.face.map((c, i) => (
            <stop key={i} offset={i / (m.face.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="1" x2="1" y2="0">
          {m.rim.map((c, i) => (
            <stop key={i} offset={i / (m.rim.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}-inner`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <path id={`${id}-ring`} d={`M ${CX} ${CY} m -45 0 a 45 45 0 1 1 90 0 a 45 45 0 1 1 -90 0`} />
        <clipPath id={`${id}-clip`}>
          <circle cx={CX} cy={CY} r="52" />
        </clipPath>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1d1410" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ribbon tails */}
      <g>
        <polygon points="56,112 76,120 66,172 58,162 47,168" fill={m.ribbon} stroke={m.ribbonEdge} strokeWidth="1" />
        <polygon points="104,112 84,120 94,172 102,162 113,168" fill={m.ribbon} stroke={m.ribbonEdge} strokeWidth="1" />
        <path d="M62 118 L55 163" stroke={m.stripe} strokeWidth="2" opacity="0.8" />
        <path d="M98 118 L105 163" stroke={m.stripe} strokeWidth="2" opacity="0.8" />
      </g>

      <g filter={`url(#${id}-shadow)`}>
        {/* rosette */}
        <polygon points={rosette} fill={`url(#${id}-rim)`} stroke={m.edge} strokeWidth="1" />
        {/* bevel + disc */}
        <circle cx={CX} cy={CY} r="52" fill={`url(#${id}-rim)`} stroke={m.edge} strokeWidth="1" />
        <circle cx={CX} cy={CY} r="47.5" fill={`url(#${id}-face)`} />
        <circle cx={CX} cy={CY} r="37" fill="none" stroke={m.edge} strokeOpacity="0.45" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="36" fill={`url(#${id}-face)`} />
        <circle cx={CX} cy={CY} r="36" fill={`url(#${id}-inner)`} />
      </g>

      {/* rotating inscription */}
      <g>
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${CX} ${CY}`}
            to={`360 ${CX} ${CY}`}
            dur="40s"
            repeatCount="indefinite"
          />
        )}
        <text fontFamily="var(--font-jetbrains)" fontSize="6.4" letterSpacing="2.1" fill={m.ink} opacity="0.75">
          <textPath href={`#${id}-ring`}>EXAFLAIR · SECURITY AUDIT · EXAFLAIR · SECURITY AUDIT ·</textPath>
        </text>
      </g>

      {/* stars */}
      {Array.from({ length: m.stars }).map((_, i) => (
        <Star key={i} x={CX + (i - (m.stars - 1) / 2) * 11} y={CY - 25} fill={tier === "platinum" ? "#ff752b" : m.ink} />
      ))}

      {/* emblem, drawn on when scrolled into view */}
      <motion.g
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
      >
        <g transform="translate(0 2)">
          <Emblem tier={tier} color={m.ink} />
        </g>
      </motion.g>

      {/* name banner across the disc */}
      <g>
        <path d="M44 100 H116 L112 107 L116 114 H44 L48 107 Z" fill={m.ribbon} stroke={m.ribbonEdge} strokeWidth="1" />
        <text
          x={CX}
          y="110"
          textAnchor="middle"
          fontFamily="var(--font-jetbrains)"
          fontSize="7.5"
          fontWeight="600"
          letterSpacing="2.5"
          fill={tier === "platinum" ? "#ffb27a" : "#fff"}
        >
          {label}
        </text>
      </g>

      {/* light sheen */}
      {!reduce && (
        <g clipPath={`url(#${id}-clip)`}>
          <g transform="skewX(-20)">
            <motion.rect
              y="0"
              width="30"
              height="176"
              fill={`url(#${id}-sheen)`}
              initial={{ x: -40 }}
              animate={{ x: [-40, 220] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 + m.stars * 0.8, ease: "easeInOut" }}
            />
          </g>
        </g>
      )}

      {tier === "platinum" &&
        !reduce &&
        [
          [26, 30],
          [136, 44],
          [132, 112],
        ].map(([x, y], i) => (
          <motion.g
            key={i}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, delay: i * 0.7, repeat: Infinity }}
          >
            <Star x={x} y={y} fill="#ff752b" />
          </motion.g>
        ))}
    </svg>
  );
}
