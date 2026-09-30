"use client";

/* eslint-disable @next/next/no-img-element -- plain <img> keeps SVG logos crisp */
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { TierBadge, type Tier } from "@/components/live/tier-badge";
import { SeverityBar } from "@/components/portfolio/severity-bar";
import { findings, totalFindings, type Audit } from "@/data/audits";

const filters: { key: Tier | "all"; label: string }[] = [
  { key: "all", label: "All audits" },
  { key: "platinum", label: "Platinum" },
  { key: "gold", label: "Gold" },
  { key: "silver", label: "Silver" },
];

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function ClientMark({ audit }: { audit: Audit }) {
  if (audit.clientLogoUrl) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
        <img src={audit.clientLogoUrl} alt={audit.clientName} className="h-full w-full object-cover" />
      </span>
    );
  }
  const initials = audit.clientName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-sm text-flame-soft">
      {initials}
    </span>
  );
}

function AuditCard({ audit }: { audit: Audit }) {
  const total = totalFindings(audit);
  const meta = [audit.chain, audit.language, dateFormat.format(new Date(audit.auditedAt))].filter(Boolean);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group/card relative flex flex-col rounded-2xl border border-line bg-white/60 p-6 transition-colors hover:border-flame/50 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ClientMark audit={audit} />
          <div className="min-w-0">
            <p className="truncate text-[13px] text-muted">{audit.clientName}</p>
            <h3 className="line-clamp-2 font-serif text-2xl leading-tight">
              {/* stretched link: the whole card opens the audit page */}
              <Link href={`/portfolio/${audit.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
                {audit.projectName}
              </Link>
            </h3>
          </div>
        </div>
        <div className="-mt-3 -mr-2 shrink-0">
          <TierBadge tier={audit.tier} size={62} />
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] tracking-wide text-ink/50 uppercase">{meta.join(" · ")}</p>

      {audit.summary && <p className="mt-4 line-clamp-2 text-[15px] leading-relaxed text-ink/70">{audit.summary}</p>}

      <div className="mt-6 flex-1">
        <SeverityBar findings={findings(audit)} total={total} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
        <span className="text-[13px] text-muted">
          <span className="font-mono text-ink">{total}</span> findings
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-coal px-4 py-2 text-[13px] text-white transition-colors group-hover/card:bg-flame">
          View case study
          <span className="transition-transform group-hover/card:translate-x-0.5">→</span>
        </span>
      </div>
    </motion.article>
  );
}

/** Tier filter + animated grid of audit cards. */
export function AuditGrid({ audits }: { audits: Audit[] }) {
  const [filter, setFilter] = useState<Tier | "all">("all");
  const shown = filter === "all" ? audits : audits.filter((a) => a.tier === filter);
  const count = (key: Tier | "all") => (key === "all" ? audits.length : audits.filter((a) => a.tier === key).length);

  return (
    <div>
      <div role="tablist" aria-label="Filter audits by tier" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${
                active ? "text-white" : "text-ink/70 hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="audit-filter"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                {f.label} <span className={active ? "text-white/50" : "text-ink/35"}>{count(f.key)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((a) => (
            <AuditCard key={a.slug} audit={a} />
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line px-6 py-16 text-center text-ink/50">
          No {filter === "all" ? "" : `${filter} `}audits published yet.
        </p>
      )}
    </div>
  );
}
