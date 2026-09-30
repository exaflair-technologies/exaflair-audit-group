"use client";

import { motion } from "motion/react";
import type { Severity } from "@/data/audits";
import { severities } from "@/components/portfolio/severity-styles";


/** Stacked bar of findings by severity, grown in on scroll, with a count per severity underneath. */
export function SeverityBar({ findings, total }: { findings: Record<Severity, number>; total: number }) {
  return (
    <div>
      <div
        className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-paper-2"
        role="img"
        aria-label={severities.map((s) => `${findings[s.key]} ${s.label.toLowerCase()}`).join(", ")}
      >
        {total > 0 &&
          severities
            .filter((s) => findings[s.key] > 0)
            .map((s, i) => (
              <motion.div
                key={s.key}
                className={s.bar}
                initial={{ width: 0 }}
                whileInView={{ width: `${(findings[s.key] / total) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
      </div>

      <dl className="mt-4 grid grid-cols-5 gap-2">
        {severities.map((s) => (
          <div key={s.key}>
            <dt className="text-[11px] text-muted">{s.label}</dt>
            <dd className={`mt-0.5 font-mono text-lg ${findings[s.key] ? s.text : "text-ink/25"}`}>{findings[s.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
