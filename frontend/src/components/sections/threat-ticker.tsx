"use client";

import { motion, useReducedMotion } from "motion/react";

const threats = [
  "Reentrancy",
  "Access control",
  "Overflow & underflow",
  "Rounding direction",
  "Denial of service",
  "Unbounded loops",
  "Admin key compromise",
  "Unsafe upgrades",
  "Unchecked external calls",
  "Precision loss",
];

/** Slow marquee of the bug classes every audit hunts for. */
export function ThreatTicker() {
  const reduce = useReducedMotion();
  const row = [...threats, ...threats];

  return (
    <div className="relative overflow-hidden border-y border-line py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <motion.ul
        className="flex w-max gap-10"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        aria-label="Vulnerability classes we test for"
      >
        {row.map((t, i) => (
          <li key={i} aria-hidden={i >= threats.length} className="flex items-center gap-10 text-[15px] whitespace-nowrap text-ink/60">
            {t}
            <svg viewBox="0 0 10 12" className="h-3 w-2.5 text-flame" aria-hidden>
              <path d="M5 0.5 L9.5 2 V6 C9.5 8.6 7.6 10.4 5 11.5 C2.4 10.4 0.5 8.6 0.5 6 V2 Z" fill="currentColor" />
            </svg>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
