"use client";

import { motion, useReducedMotion } from "motion/react";

// 16×16 stroke icons, one per attack class.
const icons: Record<string, React.ReactNode> = {
  // call loops back in before state is updated
  reentrancy: <path d="M12.5 5.5A5 5 0 1 0 13 9M12.5 2v3.5H9" />,
  // key
  access: (
    <>
      <circle cx="5.5" cy="8" r="3" />
      <path d="M8.5 8H14M12 8v2.5M14 8v2" />
    </>
  ),
  // up and down arrows
  overflow: <path d="M5 13V3M2.5 5.5 5 3l2.5 2.5M11 3v10M8.5 10.5 11 13l2.5-2.5" />,
  // value rounding to a step
  rounding: <path d="M2 12h4V8h4V4h4M2 4h2M12 12h2" />,
  // service blocked
  dos: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M4.2 11.8l7.6-7.6" />
    </>
  ),
  // loop that never ends
  loops: <path d="M8 8c-1.5-2-2.6-3-4-3a3 3 0 0 0 0 6c1.4 0 2.5-1 4-3s2.6-3 4-3a3 3 0 0 1 0 6c-1.4 0-2.5-1-4-3Z" />,
  // cracked key
  admin: (
    <>
      <circle cx="5.5" cy="10.5" r="3" />
      <path d="M7.6 8.4 13 3M11 5l1.5 1.5M9.5 2.5 8.5 4 10 4.5 9 6" />
    </>
  ),
  // new version stacked on the old
  upgrades: <path d="M3 13h10M3 10h10M8 7.5V2M5.5 4.5 8 2l2.5 2.5" />,
  // call leaving the contract
  external: <path d="M9 2.5h4.5V7M13.5 2.5 7 9M11.5 9.5v3.5h-9v-9h3.5" />,
  // digits dropped after the point
  precision: (
    <>
      <path d="M2 12.5h1" strokeWidth="2.2" />
      <path d="M6 4.5h2.5v8M6 12.5h5" />
      <path d="M12.5 4.5v3M14 6h-3" opacity="0.5" />
    </>
  ),
};

const threats = [
  { label: "Reentrancy", icon: "reentrancy" },
  { label: "Access control", icon: "access" },
  { label: "Overflow & underflow", icon: "overflow" },
  { label: "Rounding direction", icon: "rounding" },
  { label: "Denial of service", icon: "dos" },
  { label: "Unbounded loops", icon: "loops" },
  { label: "Admin key compromise", icon: "admin" },
  { label: "Unsafe upgrades", icon: "upgrades" },
  { label: "Unchecked external calls", icon: "external" },
  { label: "Precision loss", icon: "precision" },
];

/** Slow marquee of the bug classes every audit hunts for, each with its own icon. */
export function ThreatTicker() {
  const reduce = useReducedMotion();
  const row = [...threats, ...threats];

  return (
    <div className="relative overflow-hidden border-y border-line py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <motion.ul
        className="flex w-max gap-12"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        aria-label="Vulnerability classes we test for"
      >
        {row.map((t, i) => (
          <li key={i} aria-hidden={i >= threats.length} className="flex items-center gap-3 text-[15px] whitespace-nowrap text-ink/60">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-flame/10 text-flame">
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {icons[t.icon]}
              </svg>
            </span>
            {t.label}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
