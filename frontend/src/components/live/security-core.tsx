"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// Rotation that points each face outward before it is pushed out by half the cube size.
const faces = [
  "rotateY(0deg)",
  "rotateY(90deg)",
  "rotateY(180deg)",
  "rotateY(-90deg)",
  "rotateX(90deg)",
  "rotateX(-90deg)",
];

// Fixed values (not Math.random) so server and client render the same markup.
const sparks = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + (i % 3) * 0.3;
  const dist = 130 + (i % 4) * 18;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, delay: i * 0.26, size: 2 + (i % 3) };
});

const checks = [
  { label: "Reentrancy", pos: "left-0 top-[14%]", float: 0 },
  { label: "Access control", pos: "left-[1%] bottom-[20%]", float: 0.8 },
  { label: "Invariants", pos: "right-0 top-[22%]", float: 0.4 },
  { label: "Fuzz · 12k runs", pos: "right-[1%] bottom-[13%]", float: 1.2 },
];

const glass =
  "border-[1.5px] border-[#ff8a4c] " +
  "[background:linear-gradient(135deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_36%)," +
  "repeating-linear-gradient(0deg,rgba(255,255,255,0.07)_0_1px,transparent_1px_12.5%)," +
  "repeating-linear-gradient(90deg,rgba(255,255,255,0.07)_0_1px,transparent_1px_12.5%)," +
  "linear-gradient(160deg,rgba(255,150,90,0.34),rgba(255,117,43,0.1)_58%,rgba(210,80,20,0.3))] " +
  "shadow-[inset_0_0_42px_rgba(255,117,43,0.5),0_0_26px_rgba(255,117,43,0.35)]";

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
      {[
        [50, 4],
        [50, 96],
        [4, 50],
        [96, 50],
        [12, 28],
        [88, 72],
        [88, 28],
        [12, 72],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" fill="#fff" opacity="0.8" />
      ))}

      <circle cx="50" cy="50" r="23" fill="rgba(255,255,255,0.06)" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
      <circle
        cx="50"
        cy="50"
        r="19.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.1"
        strokeDasharray="1.5 4"
        className="ring-spin"
      />

      <g style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.8))" }}>
        <path d="M43 47 V42.5 a7 7 0 0 1 14 0 V47" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <rect x="39" y="47" width="22" height="16" rx="3.5" fill="rgba(255,255,255,0.22)" stroke="#fff" strokeWidth="2.4" />
        <circle cx="50" cy="53.5" r="2" fill="#fff" />
        <path d="M50 55 V59" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function StatusChip({ label, scanning }: { label: string; scanning: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-white/80 py-1.5 pr-3.5 pl-2.5 font-mono text-[11px] whitespace-nowrap text-ink shadow-[0_8px_24px_-12px_rgba(29,20,16,0.35)] backdrop-blur">
      <span className="relative flex h-4 w-4 items-center justify-center">
        {scanning ? (
          <motion.span
            className="h-3 w-3 rounded-full border-[1.5px] border-flame border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} viewBox="0 0 16 16" className="h-4 w-4 text-ok">
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
            <path d="M4.8 8.3l2.1 2.1 4.3-4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </span>
      {label}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={scanning ? "scan" : "ok"}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
          className={scanning ? "text-flame" : "text-ok"}
        >
          {scanning ? "scanning" : "secure"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Glass security cube with a spinning core, scan plane, flowing circuit faces and live check chips. */
export function SecurityCore() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % checks.length), 1900);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div
      className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center [--core:calc(var(--cube)*0.36)] [--cube:clamp(150px,40vw,210px)] [perspective:1200px]"
      aria-hidden
    >
      {/* glow + rays, kept tight around the cube */}
      <motion.div
        className="absolute inset-[30%] rounded-full bg-flame/40 blur-[60px]"
        animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[6%] rounded-full [background:repeating-conic-gradient(from_0deg,rgba(255,117,43,0.2)_0deg_2deg,transparent_2deg_12deg)] [mask-image:radial-gradient(circle,#000_16%,transparent_58%)]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />

      {/* base: shadow and rotating rings */}
      <div className="absolute bottom-[22%] left-1/2 h-6 w-[38%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-xl" />
      <div className="absolute bottom-[1%] left-1/2 w-[70%] -translate-x-1/2 [transform-style:preserve-3d]">
        <motion.div
          className="aspect-square w-full rounded-full border border-dashed border-flame/50"
          style={{ rotateX: 78 }}
          animate={reduce ? undefined : { rotateZ: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {["top-0 left-1/2", "top-1/2 left-full", "top-full left-1/2", "top-1/2 left-0"].map((pos) => (
            <span
              key={pos}
              className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame shadow-[0_0_12px_3px_rgba(255,117,43,0.7)] ${pos}`}
            />
          ))}
        </motion.div>
      </div>
      <div className="absolute bottom-[5%] left-1/2 w-[52%] -translate-x-1/2">
        <motion.div
          className="aspect-square w-full rounded-full border border-flame/30"
          style={{ rotateX: 78 }}
          animate={reduce ? undefined : { rotateZ: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* sparks */}
      {!reduce &&
        sparks.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-flame-soft shadow-[0_0_10px_2px_rgba(255,117,43,0.6)]"
            style={{ width: s.size, height: s.size }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: [0, s.x], y: [0, s.y], opacity: [0, 1, 0], scale: [0.4, 1, 0.3] }}
            transition={{ duration: 3, delay: s.delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

      {/* floating cube */}
      <motion.div
        className="[transform-style:preserve-3d]"
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="relative h-[var(--cube)] w-[var(--cube)] [transform-style:preserve-3d]"
          initial={{ rotateX: -24, rotateY: 35 }}
          animate={reduce ? undefined : { rotateY: 395, rotateX: [-24, 16, -24] }}
          transition={{
            rotateY: { duration: 16, repeat: Infinity, ease: "linear" },
            rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* inner core cube, spinning the other way */}
          <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
            <motion.div
              className="relative h-[var(--core)] w-[var(--core)] [transform-style:preserve-3d]"
              animate={reduce ? undefined : { rotateX: 360, rotateY: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              {faces.map((f) => (
                <div
                  key={f}
                  className="absolute inset-0 border border-white/80 bg-[linear-gradient(135deg,#ffc79e,#ff752b_55%,#d9480f)] opacity-90 shadow-[0_0_30px_rgba(255,117,43,0.9),inset_0_0_12px_rgba(255,255,255,0.5)]"
                  style={{ transform: `${f} translateZ(calc(var(--core) / 2))` }}
                />
              ))}
            </motion.div>
          </div>

          {/* scan plane sweeping through */}
          <div className="cube-scan absolute inset-[3%] border border-[#ffb27a] bg-[radial-gradient(circle,rgba(255,117,43,0.28),rgba(255,117,43,0.05)_70%)] shadow-[0_0_24px_rgba(255,117,43,0.6)]" />

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

      {/* live check chips fill the space either side */}
      {checks.map((c, i) => (
        <motion.div
          key={c.label}
          className={`absolute hidden sm:block ${c.pos}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: 0.8 + i * 0.15 },
            scale: { delay: 0.8 + i * 0.15 },
            y: { duration: 4, delay: c.float, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <StatusChip label={c.label} scanning={!reduce && i === active} />
        </motion.div>
      ))}
    </div>
  );
}
