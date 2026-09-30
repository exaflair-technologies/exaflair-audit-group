import Image from "next/image";
import Link from "next/link";
import { bookCallHref, navLinks, socialLinks } from "@/lib/links";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-8 lg:px-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Image src="/exaflair-logo.png" alt="Exaflair" width={1454} height={291} className="h-5 w-auto" />
          <p className="mt-4 text-[14px] leading-relaxed text-ink/60">
            Smart contract audits from the Exaflair team, built by people who ship contracts too.
          </p>
        </div>

        <div className="flex gap-16 text-[14px]">
          <ul className="space-y-3">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-ink/70 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={bookCallHref} className="text-ink/70 hover:text-ink">
                Book a call
              </a>
            </li>
          </ul>
          <ul className="space-y-3">
            {socialLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className="text-ink/70 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 text-[13px] text-ink/45 sm:px-8 lg:px-12">
        © {new Date().getFullYear()} Exaflair Technologies
      </div>
    </footer>
  );
}
