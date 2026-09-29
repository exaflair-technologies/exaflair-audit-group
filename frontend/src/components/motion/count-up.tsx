"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Counts from 0 to `to` the first time it scrolls into view. */
export function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, {
      duration: reduce ? 0 : duration,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => c.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
    </span>
  );
}
