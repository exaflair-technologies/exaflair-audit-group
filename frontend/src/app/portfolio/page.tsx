import type { Metadata } from "next";
import { AuditGrid } from "@/components/portfolio/audit-grid";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getAuditStats, listAudits, type Audit, type AuditStats } from "@/server/services/audits.service";

export const metadata: Metadata = {
  title: "Audit portfolio — Exaflair Audits",
  description: "Smart contract audits delivered by Exaflair, with findings by severity and downloadable reports.",
};

// Re-fetch every 5 minutes. Signed report links last an hour, so they never go stale on a cached page.
export const revalidate = 300;

async function loadPortfolio(): Promise<{ audits: Audit[]; stats: AuditStats } | null> {
  try {
    const [{ audits }, stats] = await Promise.all([listAudits({ limit: 100 }), getAuditStats()]);
    return { audits, stats };
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const portfolio = await loadPortfolio();
  const stats = [
    { label: "Audits delivered", value: portfolio?.stats.audits ?? 0 },
    { label: "Findings reported", value: portfolio?.stats.totalFindings ?? 0 },
    {
      label: "Critical + high caught",
      value: (portfolio?.stats.bySeverity.critical ?? 0) + (portfolio?.stats.bySeverity.high ?? 0),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_80%_20%,#000_10%,transparent_60%)]"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <Reveal className="max-w-3xl">
              <p className="font-mono text-xs tracking-[0.2em] text-flame uppercase">Audit portfolio</p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl">
                Contracts we&apos;ve <span className="italic text-flame">broken first.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/70">
                Every audit we&apos;ve signed off, with what we found by severity. Open a report to see
                each finding at the exact line.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <dl className="mt-14 grid max-w-3xl grid-cols-3 gap-6 border-t border-line pt-8">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="mt-2 text-[13px] text-muted sm:text-[14px]">{s.label}</dt>
                    <dd className="font-serif text-4xl sm:text-5xl">
                      <CountUp to={s.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        <section className="pb-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            {portfolio ? (
              <AuditGrid audits={portfolio.audits} />
            ) : (
              <p className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-ink/50">
                Couldn&apos;t load audits right now. Please try again shortly.
              </p>
            )}
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
