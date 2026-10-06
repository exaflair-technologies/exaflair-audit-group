"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { bookCallHref, navLinks } from "@/lib/links";

/** `overlay` renders light-on-dark while the bar sits transparent over a dark hero. */
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
    setPastHero(y > window.innerHeight - 80);
  });
  // Over a dark full-screen hero, stay dark until the hero has scrolled away.
  const dark = overlay && !pastHero && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        dark
          ? scrolled
            ? "border-b border-white/10 bg-night/70 backdrop-blur-md"
            : "border-b border-transparent"
          : scrolled || open
            ? "border-b border-line bg-paper/85 backdrop-blur-md"
            : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="Exaflair Audits home">
          <Image
            src={dark ? "/exaflair-logo-light.png" : "/exaflair-logo.png"}
            alt="Exaflair"
            width={1454}
            height={291}
            priority
            className="h-5 w-auto sm:h-6"
          />
          <span className="rounded-full border border-flame/40 px-2 py-0.5 font-medium text-[12px] tracking-[0.18em] text-flame uppercase">
            Audits
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ul className="mr-4 hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={`group relative text-[15px] transition-colors ${dark ? "text-white/75 hover:text-white" : "text-ink/80 hover:text-ink"}`}>
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-flame transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={bookCallHref}
            className={`hidden rounded-md px-5 py-2.5 text-sm transition-colors sm:inline-block ${
              dark ? "bg-white text-ink hover:bg-flame hover:text-white" : "bg-ink-2 text-white hover:bg-ink"
            }`}
          >
            Book a call
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative flex h-10 w-10 items-center justify-center md:hidden"
          >
            <motion.span
              className={`absolute h-px w-5 ${dark ? "bg-white" : "bg-ink"}`}
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
            />
            <motion.span
              className={`absolute h-px w-5 ${dark ? "bg-white" : "bg-ink"}`}
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pt-2 pb-6">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="block py-3 font-semibold tracking-tight text-2xl" onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3">
                <a href={bookCallHref} className="block rounded-md bg-ink-2 px-5 py-3 text-center text-white">
                  Book a call
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
