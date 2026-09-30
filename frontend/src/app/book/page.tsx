import type { Metadata } from "next";
import { BookingForm } from "@/components/book/booking-form";
import { Reveal } from "@/components/motion/reveal";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

export const metadata: Metadata = {
  title: "Book an audit call | Exaflair Audits",
  description: "Tell us what you're building. We'll suggest a tier and scope your smart contract audit on the first call.",
};

const contact = [
  {
    label: "Email",
    value: "admin@exaflair.com",
    href: "mailto:admin@exaflair.com",
    icon: (
      <>
        <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
        <path d="m2.5 4.5 5.5 4 5.5-4" />
      </>
    ),
  },
  {
    label: "Address",
    value: "Mohali, Punjab 140603, IN",
    icon: (
      <>
        <path d="M8 14.5s-4.5-4-4.5-7.5a4.5 4.5 0 0 1 9 0c0 3.5-4.5 7.5-4.5 7.5Z" />
        <circle cx="8" cy="7" r="1.6" />
      </>
    ),
  },
];

export default function BookPage() {
  return (
    <>
      <Navbar overlay />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-night pt-28 pb-20 text-white sm:pt-36 sm:pb-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_10%,rgba(255,117,43,0.16),transparent_70%)]" />
            <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_20%_30%,#000,transparent_65%)]" />
          </div>

          <div className="mx-auto grid max-w-7xl items-start gap-14 px-4 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:px-12">
            <Reveal className="lg:sticky lg:top-32">
              <p className="font-mono text-xs tracking-[0.2em] text-flame uppercase">Book a call</p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl">
                Let&apos;s scope <span className="bg-gradient-to-r from-flame-soft to-flame bg-clip-text text-transparent italic">your audit.</span>
              </h1>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/65">
                Tell us what you&apos;re building and when it launches. We&apos;ll suggest a tier and scope the
                audit on the first call.
              </p>

              <h2 className="mt-12 font-serif text-2xl">Contact information</h2>
              <ul className="mt-6 space-y-5">
                {contact.map((c) => (
                  <li key={c.label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-flame/30 bg-flame/10 text-flame">
                      <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        {c.icon}
                      </svg>
                    </span>
                    <div>
                      <p className="text-[15px] font-medium text-white">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-[15px] text-white/65 underline-offset-4 hover:text-white hover:underline">
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-[15px] text-white/65">{c.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1} className="relative rounded-2xl bg-paper p-6 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] sm:p-9">
              <BookingForm />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
