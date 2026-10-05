/* eslint-disable @next/next/no-img-element -- plain <img> keeps logos crisp */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TierBadge } from "@/components/live/tier-badge";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { FindingsList } from "@/components/portfolio/findings-list";
import { severities, statusStyles } from "@/components/portfolio/severity-styles";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { audits, findingsBySeverity, getAudit, type Audit, type IssueStatus } from "@/data/audits";

export const dynamicParams = false;

export function generateStaticParams() {
  return audits.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const audit = getAudit((await params).slug);
  if (!audit) return {};
  return {
    title: `${audit.projectName} audit | Exaflair Audits`,
    description: audit.summary,
  };
}

const tierLabel = { silver: "Silver", gold: "Gold", platinum: "Platinum" } as const;

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dayMs = 24 * 60 * 60 * 1000;

function period(a: Audit) {
  const days = Math.round((Date.parse(a.auditedAt) - Date.parse(a.startedAt)) / dayMs) + 1;
  return { label: `${dateFmt.format(new Date(a.startedAt))} – ${dateFmt.format(new Date(a.auditedAt))}`, days };
}

/** Before vs after: every finding open at handoff, and what is still open once fixes were reviewed. */
function BeforeAfter({ audit }: { audit: Audit }) {
  const before = findingsBySeverity(audit.issues);
  const after = findingsBySeverity(audit.issues.filter((i) => i.status !== "resolved"));
  const total = audit.issues.length;
  const remaining = total - audit.issues.filter((i) => i.status === "resolved").length;
  const statusCounts = (Object.keys(statusStyles) as IssueStatus[])
    .map((s) => ({ s, n: audit.issues.filter((i) => i.status === s).length }))
    .filter((x) => x.n > 0);

  const column = (
    title: string,
    caption: string,
    counts: Record<string, number>,
    headline: number,
    headlineLabel: string,
    tone: "before" | "after",
  ) => (
    <div
      className={`flex flex-col rounded-2xl border p-6 sm:p-8 ${
        tone === "before" ? "border-sev-c/20 bg-sev-c/[0.03]" : "border-ok/20 bg-ok/[0.03]"
      }`}
    >
      <p className={`font-medium text-[11px] tracking-[0.2em] uppercase ${tone === "before" ? "text-sev-c" : "text-ok"}`}>{title}</p>
      <p className="mt-1 text-[14px] text-muted">{caption}</p>
      <p className="mt-6 font-semibold tracking-tight text-6xl leading-none">
        <CountUp to={headline} />
      </p>
      <p className="mt-2 text-[14px] text-ink/70">{headlineLabel}</p>
      <dl className="mt-8 space-y-3">
        {severities
          .filter((s) => before[s.key] > 0)
          .map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <dt className="w-16 shrink-0 text-[13px] text-muted">{s.label}</dt>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                <div
                  className={`h-full rounded-full ${s.bar}`}
                  style={{ width: `${(counts[s.key] / Math.max(...Object.values(before))) * 100}%` }}
                />
              </div>
              <dd className={`w-6 text-right font-medium text-[15px] ${counts[s.key] ? s.text : "text-ink/25"}`}>{counts[s.key]}</dd>
            </div>
          ))}
      </dl>
    </div>
  );

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
      {column("Before", "At report handoff", before, total, "open findings", "before")}
      <div className="flex items-center justify-center text-3xl text-flame md:px-2" aria-hidden>
        <span className="rotate-90 md:rotate-0">→</span>
      </div>
      <div className="flex flex-col gap-4">
        {column("After", "After fix review", after, remaining, remaining === 1 ? "finding not fully closed" : "findings not fully closed", "after")}
        <div className="flex flex-wrap gap-2">
          {statusCounts.map(({ s, n }) => (
            <span key={s} className={`rounded-full px-3 py-1 text-[13px] ${statusStyles[s].cls}`}>
              {n} {statusStyles[s].label.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AuditPage({ params }: PageProps<"/portfolio/[slug]">) {
  const audit = getAudit((await params).slug);
  if (!audit) notFound();

  const { label: periodLabel, days } = period(audit);
  const counts = findingsBySeverity(audit.issues);
  const meta = [
    { label: "Timeline", value: periodLabel },
    { label: "Duration", value: `${days} days` },
    audit.chain && { label: "Chain", value: audit.chain },
    audit.language && { label: "Language", value: audit.language },
  ].filter(Boolean) as { label: string; value: string; mono?: boolean }[];

  return (
    <>
      <Navbar overlay />
      <main className="flex-1">
        {/* header */}
        <section className="relative isolate overflow-hidden bg-night pt-28 pb-24 text-white sm:pt-32 sm:pb-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_30%,rgba(168,159,200,0.16),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(255,117,43,0.12),transparent_70%)]" />
            <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_70%_40%,#000,transparent_70%)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <Link href="/portfolio" className="group inline-flex items-center gap-2 text-[14px] text-white/60 hover:text-white">
              <span className="transition-transform group-hover:-translate-x-1">←</span> All audits
            </Link>

            <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
              <Reveal>
                <div className="flex items-center gap-4">
                  {audit.clientLogoUrl && (
                    <img
                      src={audit.clientLogoUrl}
                      alt={audit.clientName}
                      className={`h-16 w-16 rounded-2xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(168,159,200,0.6)] ${audit.clientLogoFit === "contain" ? "bg-white object-contain p-1.5" : "object-cover"}`}
                    />
                  )}
                  <div>
                    <p className="font-medium text-xs tracking-[0.2em] text-flame uppercase">Case study · {audit.clientName}</p>
                    <p className="mt-1 text-[14px] text-white/50">Security review</p>
                  </div>
                </div>
                <h1 className="mt-6 font-semibold tracking-tight text-5xl leading-[1.05] sm:text-6xl">{audit.projectName}</h1>
                <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/65">{audit.summary}</p>

                <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-8 sm:grid-cols-3">
                  {meta.map((m) => (
                    <div key={m.label}>
                      <dt className="text-[12px] tracking-wide text-white/40 uppercase">{m.label}</dt>
                      <dd className={`mt-1 text-[15px] text-white/90 ${m.mono ? "font-medium text-[14px] break-all" : ""}`}>
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.15} className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-[15%] rounded-full bg-[#a89fc8]/30 blur-3xl" aria-hidden />
                  <div className="relative">
                    <TierBadge tier={audit.tier} size={220} />
                  </div>
                </div>
                <p className="mt-4 font-semibold tracking-tight text-2xl">{tierLabel[audit.tier]} audit</p>
                {audit.reportUrl ? (
                  <a
                    href={audit.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 rounded-md bg-flame px-5 py-2.5 text-[14px] text-white transition-colors hover:bg-[#ff8a4c]"
                  >
                    See PDF ↗
                  </a>
                ) : (
                  <p className="mt-3 text-[13px] text-white/40">Full report available on request</p>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* findings by severity: card overlapping the header */}
        <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-8 lg:px-12">
          <Reveal className="rounded-2xl border border-line bg-white p-6 shadow-[0_24px_60px_-30px_rgba(12,8,6,0.45)] sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[220px_1fr]">
              <div className="lg:border-r lg:border-line lg:pr-8">
                <p className="font-medium text-[11px] tracking-[0.2em] text-muted uppercase">Total findings</p>
                <p className="mt-2 font-semibold tracking-tight text-7xl leading-none">
                  <CountUp to={audit.issues.length} />
                </p>
                <p className="mt-3 text-[14px] text-ink/60">
                  across {severities.filter((s) => counts[s.key] > 0).length} severity levels
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {severities
                  .filter((s) => counts[s.key] > 0)
                  .map((s) => {
                    const pct = Math.round((counts[s.key] / audit.issues.length) * 100);
                    return (
                      <div key={s.key} className={`rounded-xl p-4 ${s.soft}`}>
                        <p className="flex items-center gap-2 text-[13px] text-ink/70">
                          <span className={`h-2 w-2 rounded-full ${s.bar}`} />
                          {s.label}
                        </p>
                        <p className={`mt-3 font-semibold tracking-tight text-5xl leading-none ${s.text}`}>
                          <CountUp to={counts[s.key]} />
                        </p>
                        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/80">
                          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 font-medium text-[11px] text-ink/45">{pct}% of findings</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* overall mix */}
            <div className="mt-8 flex h-2.5 gap-1 overflow-hidden rounded-full" role="img" aria-label="Findings by severity">
              {severities
                .filter((s) => counts[s.key] > 0)
                .map((s) => (
                  <div key={s.key} className={`h-full rounded-full ${s.bar}`} style={{ flexGrow: counts[s.key] }} />
                ))}
            </div>
          </Reveal>
        </section>

        {/* case study + timeline */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:px-12">
            <Reveal>
              <p className="font-medium text-xs tracking-[0.2em] text-flame uppercase">Case study</p>
              <h2 className="mt-4 font-semibold tracking-tight text-4xl leading-tight sm:text-5xl">
                What we found, <span className="text-flame">and what changed.</span>
              </h2>
              <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink/75">
                {audit.caseStudy.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-medium text-xs tracking-[0.2em] text-flame uppercase">Timeline</p>
              <ol className="relative mt-8 space-y-8 border-l border-line pl-8">
                {audit.timeline.map((t, i) => (
                  <li key={t.title} className="relative">
                    <span
                      className={`absolute top-1 -left-[37px] h-3 w-3 rounded-full ring-4 ring-paper ${
                        i === audit.timeline.length - 1 ? "bg-ok" : "bg-flame"
                      }`}
                    />
                    <p className="font-medium text-[12px] tracking-wide text-muted uppercase">{t.date}</p>
                    <p className="mt-1 font-semibold tracking-tight text-xl">{t.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink/65">{t.detail}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* before / after */}
        <section className="bg-paper-2/60 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <Reveal className="max-w-2xl">
              <p className="font-medium text-xs tracking-[0.2em] text-flame uppercase">Before &amp; after</p>
              <h2 className="mt-4 font-semibold tracking-tight text-4xl leading-tight sm:text-5xl">
                From {audit.issues.length} open issues <span className="text-flame">to verified fixes.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-12">
              <BeforeAfter audit={audit} />
            </Reveal>
          </div>
        </section>

        {/* every finding */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <Reveal className="max-w-2xl">
              <p className="font-medium text-xs tracking-[0.2em] text-flame uppercase">Findings</p>
              <h2 className="mt-4 font-semibold tracking-tight text-4xl leading-tight sm:text-5xl">Every issue, line by line.</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-ink/70">
                Open a finding to see what was wrong and how the fix changed it.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <FindingsList issues={audit.issues} />
            </Reveal>
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
