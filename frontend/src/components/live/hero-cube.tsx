"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

// Rotation that points each face outward before it is pushed out by half the cube size.
const faces = [
  "rotateY(0deg)",
  "rotateY(90deg)",
  "rotateY(180deg)",
  "rotateY(-90deg)",
  "rotateX(90deg)",
  "rotateX(-90deg)",
];

const glass =
  "border-[1.5px] border-[#ff8a4c] " +
  "[background:linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_36%)," +
  "repeating-linear-gradient(0deg,rgba(255,255,255,0.07)_0_1px,transparent_1px_12.5%)," +
  "repeating-linear-gradient(90deg,rgba(255,255,255,0.07)_0_1px,transparent_1px_12.5%)," +
  "linear-gradient(160deg,rgba(255,150,90,0.3),rgba(255,117,43,0.08)_58%,rgba(210,80,20,0.28))] " +
  "shadow-[inset_0_0_48px_rgba(255,117,43,0.55),0_0_40px_rgba(255,117,43,0.35)]";

const traces = [
  "M50 4 V26",
  "M50 96 V74",
  "M4 50 H26",
  "M96 50 H74",
  "M12 28 H24 L32 36",
  "M88 72 H76 L68 64",
  "M88 28 H76 L68 36",
  "M12 72 H24 L32 64",
];

/** Artwork on the outward side of a face: corner brackets, flowing circuit traces, lock in a spinning ring. */
function FaceArt() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
        <path d="M5 16 V5 H16" />
        <path d="M84 5 H95 V16" />
        <path d="M95 84 V95 H84" />
        <path d="M16 95 H5 V84" />
      </g>
      <g fill="none" strokeWidth="0.9" strokeLinecap="round">
        {traces.map((d) => (
          <g key={d}>
            <path d={d} stroke="#fff" strokeOpacity="0.28" />
            <path d={d} stroke="#fff" strokeDasharray="4 14" className="trace-flow" />
          </g>
        ))}
      </g>
      <circle cx="50" cy="50" r="23" fill="rgba(255,255,255,0.06)" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="19.5" fill="none" stroke="#fff" strokeWidth="1.1" strokeDasharray="1.5 4" className="ring-spin" />
      <g style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.8))" }}>
        <path d="M43 47 V42.5 a7 7 0 0 1 14 0 V47" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <rect x="39" y="47" width="22" height="16" rx="3.5" fill="rgba(255,255,255,0.22)" stroke="#fff" strokeWidth="2.4" />
        <circle cx="50" cy="53.5" r="2" fill="#fff" />
        <path d="M50 55 V59" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ---------- orbit ---------- */

// Ellipse in % of the stage: horizontal radius, vertical radius, tilt, and centre height.
const RX = 43;
const RY = 11;
const TILT = 5;
const CY = 56;

const orbitPoint = (a: number) => ({
  x: 50 + Math.cos(a) * RX,
  y: CY + Math.sin(a) * RY - Math.cos(a) * TILT,
  depth: Math.sin(a), // -1 = behind the cube, 1 = in front
});

/** Half of the orbit path; the front half is drawn over the cube, the back half under it. */
function orbitPath(front: boolean) {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const a = (front ? 0 : Math.PI) + (i / 60) * Math.PI;
    const p = orbitPoint(a);
    pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

const findings = [
  { label: "Reentrancy", status: "patched", tone: "text-emerald-400" },
  { label: "Oracle manipulation", status: "critical", tone: "text-red-400" },
  { label: "Access control", status: "patched", tone: "text-emerald-400" },
  { label: "Flash-loan attack", status: "high", tone: "text-orange-400" },
  { label: "Storage collision", status: "patched", tone: "text-emerald-400" },
  { label: "Signature replay", status: "medium", tone: "text-amber-300" },
  { label: "Rounding error", status: "patched", tone: "text-emerald-400" },
];

function OrbitChip({ angle, offset, item }: { angle: MotionValue<number>; offset: number; item: (typeof findings)[number] }) {
  const left = useTransform(angle, (a) => `${orbitPoint(a + offset).x}%`);
  const top = useTransform(angle, (a) => `${orbitPoint(a + offset).y}%`);
  const depth = useTransform(angle, (a) => orbitPoint(a + offset).depth);
  const scale = useTransform(depth, (d) => 0.74 + 0.26 * ((d + 1) / 2));
  const opacity = useTransform(depth, (d) => 0.3 + 0.7 * ((d + 1) / 2));
  const zIndex = useTransform(depth, (d) => (d > 0 ? 30 : 5));

  return (
    <motion.div
      className="absolute hidden sm:block"
      style={{ left, top, x: "-50%", y: "-50%", scale, opacity, zIndex }}
    >
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#1a120d]/80 py-1.5 pr-3.5 pl-2.5 font-medium text-[11px] whitespace-nowrap text-white/85 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full bg-current ${item.tone}`} />
        {item.label}
        <span className={item.tone}>{item.status}</span>
      </div>
    </motion.div>
  );
}

/** Big floating glass cube inside a wireframe shell, with audit checks orbiting it in 3D. */
export function HeroCube() {
  const reduce = useReducedMotion();
  const angle = useMotionValue(0.4);

  useAnimationFrame((t) => {
    if (!reduce) angle.set(0.4 + t / 5200);
  });

  return (
    <div
      className="relative isolate mx-auto h-full w-full max-w-[1040px] [--core:calc(var(--cube)*0.36)] [--cube:clamp(110px,min(18vw,17vh),210px)]"
      aria-hidden
    >
      {/* back half of the orbit */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-[4] h-full w-full">
        <path d={orbitPath(false)} fill="none" stroke="rgba(255,117,43,0.25)" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* light column and floor glow under the cube */}
      <div className="absolute top-1/2 left-1/2 h-[55%] w-[calc(var(--cube)*1.1)] -translate-x-1/2 bg-gradient-to-b from-flame/25 via-flame/10 to-transparent blur-2xl" />
      <div className="absolute bottom-[4%] left-1/2 h-10 w-[calc(var(--cube)*2)] -translate-x-1/2 rounded-[50%] bg-flame/30 blur-2xl" />

      {/* base rings */}
      <div className="absolute bottom-[-4%] left-1/2 w-[calc(var(--cube)*2.3)] -translate-x-1/2">
        <motion.div
          className="aspect-square w-full rounded-full border border-dashed border-flame/40"
          style={{ rotateX: 80 }}
          animate={reduce ? undefined : { rotateZ: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {["top-0 left-1/2", "top-1/2 left-full", "top-full left-1/2", "top-1/2 left-0"].map((pos) => (
            <span
              key={pos}
              className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame shadow-[0_0_14px_4px_rgba(255,117,43,0.7)] ${pos}`}
            />
          ))}
        </motion.div>
      </div>

      {/* the cube */}
      <div className="absolute inset-0 z-10 flex items-center justify-center [perspective:1400px]">
        <motion.div
          className="[transform-style:preserve-3d]"
          animate={reduce ? undefined : { y: [0, -16, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="relative h-[var(--cube)] w-[var(--cube)] [transform-style:preserve-3d]"
            initial={{ rotateX: -22, rotateY: 35 }}
            animate={reduce ? undefined : { rotateY: 395, rotateX: [-22, 14, -22] }}
            transition={{
              rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* wireframe shell, counter-rotating */}
            <motion.div
              className="absolute inset-[-18%] [transform-style:preserve-3d]"
              animate={reduce ? undefined : { rotateY: -720, rotateZ: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              {faces.map((f) => (
                <div
                  key={f}
                  className="absolute inset-0 border border-flame/30"
                  style={{ transform: `${f} translateZ(calc(var(--cube) * 0.68))` }}
                >
                  <div className="absolute inset-[12%] border border-dashed border-flame/15" />
                  {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos) => (
                    <span key={pos} className={`absolute h-2 w-2 bg-flame/70 ${pos}`} />
                  ))}
                </div>
              ))}
            </motion.div>

            {/* inner core, spinning the other way */}
            <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
              <motion.div
                className="relative h-[var(--core)] w-[var(--core)] [transform-style:preserve-3d]"
                animate={reduce ? undefined : { rotateX: 360, rotateY: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {faces.map((f) => (
                  <div
                    key={f}
                    className="absolute inset-0 border border-white/80 bg-[linear-gradient(135deg,#ffc79e,#ff752b_55%,#d9480f)] opacity-90 shadow-[0_0_40px_rgba(255,117,43,1),inset_0_0_12px_rgba(255,255,255,0.5)]"
                    style={{ transform: `${f} translateZ(calc(var(--core) / 2))` }}
                  />
                ))}
              </motion.div>
            </div>

            {/* scan plane */}
            <div className="cube-scan absolute inset-[3%] border border-[#ffb27a] bg-[radial-gradient(circle,rgba(255,117,43,0.3),rgba(255,117,43,0.05)_70%)] shadow-[0_0_30px_rgba(255,117,43,0.7)]" />

            {/* glass faces: pane visible from both sides, artwork only facing out */}
            {faces.map((f) => (
              <div
                key={f}
                className="absolute inset-0 [transform-style:preserve-3d]"
                style={{ transform: `${f} translateZ(calc(var(--cube) / 2))` }}
              >
                <div className={`absolute inset-0 ${glass}`} />
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:translateZ(1px)]">
                  <FaceArt />
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* front half of the orbit, drawn over the cube */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-20 h-full w-full">
        <path d={orbitPath(true)} fill="none" stroke="rgba(255,117,43,0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      {findings.map((item, i) => (
        <OrbitChip key={item.label} angle={angle} offset={(i / findings.length) * Math.PI * 2} item={item} />
      ))}
    </div>
  );
}
