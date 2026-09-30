import { Reveal } from "@/components/motion/reveal";
import { BorderTrail } from "@/components/motion/border-trail";
import { bookCallHref } from "@/lib/links";

export function Cta() {
  return (
    <section className="px-4 pb-24 sm:px-8 sm:pb-32 lg:px-12">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-coal px-6 py-20 text-center text-[#efeae3] sm:px-12 sm:py-24">
        <BorderTrail size={160} duration={10} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]"
        />
        <div className="relative">
          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            Ship it <span className="italic text-flame">audited.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-white/70">
            Tell us what you&apos;re building and when it launches. We&apos;ll suggest a tier and
            scope the audit on the first call.
          </p>
          <a
            href={bookCallHref}
            className="mt-10 inline-block rounded-md bg-flame px-7 py-3.5 text-[15px] text-white transition-colors hover:bg-[#f26416]"
          >
            Book a call
          </a>
        </div>
      </Reveal>
    </section>
  );
}
