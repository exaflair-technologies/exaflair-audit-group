import { Reveal } from "@/components/motion/reveal";

const checks = [
  { title: "Scope and threat model", text: "Every contract, entry point and trust boundary: who can call what, and what they could steal or break." },
  { title: "Static analysis", text: "Automated tools first, so known bug classes are out of the way before humans read." },
  { title: "Line-by-line review", text: "Business-logic flaws slip past tools. Every state-changing function gets read." },
  { title: "Test coverage", text: "Unit, fuzz and invariant tests on the critical paths: transfers, access control, math." },
  { title: "Access control", text: "Who can call privileged functions, and what happens if a key is lost or stolen." },
  { title: "External calls and reentrancy", text: "Anything that calls untrusted code before its own state is settled." },
  { title: "Arithmetic safety", text: "Overflow, underflow, precision loss, and rounding that always favours the protocol." },
  { title: "Denial of service", text: "Unbounded loops, gas limits, one user's action blocking everyone else." },
  { title: "Upgrades and admin powers", text: "What an upgrade or pause can do, and who holds those keys." },
  { title: "Remediation and re-audit", text: "Every finding gets a fix. Every fix gets re-checked before sign-off." },
];

export function Baseline() {
  return (
    <section id="baseline" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-8 lg:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs tracking-[0.2em] text-flame uppercase">In every tier</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Ten things we check <span className="italic text-flame">before anything else.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/70">
            The same base layer runs on every audit, whatever the language. Tiers decide how deep
            each item goes.
          </p>
        </Reveal>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {checks.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 0.08}>
              <div className="border-t border-line pt-5">
                <span className="font-mono text-xs text-flame">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[17px] font-medium">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
