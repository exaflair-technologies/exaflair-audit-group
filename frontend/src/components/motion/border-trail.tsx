"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A small glowing segment that travels around the parent's border.
 * The parent must be `relative` and have a border radius.
 */
export function BorderTrail({
  color = "var(--flame)",
  size = 70,
  duration = 7,
}: {
  color?: string;
  size?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
    >
      <motion.div
        className="absolute aspect-square"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ repeat: Infinity, duration, ease: "linear" }}
      />
    </div>
  );
}
