"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { bookCallHref, navLinks } from "@/lib/links";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="Exaflair Audits home">
          <Image src="/exaflair-logo.png" alt="Exaflair" width={1454} height={291} priority className="h-5 w-auto sm:h-6" />
          <span className="rounded-full border border-flame/40 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] text-flame uppercase">
            Audits
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="group relative text-[15px] text-ink/80 transition-colors hover:text-ink">
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-flame transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={bookCallHref}
            className="hidden rounded-md bg-ink-2 px-5 py-2.5 text-sm text-white transition-colors hover:bg-ink sm:inline-block"
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
              className="absolute h-px w-5 bg-ink"
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
            />
            <motion.span
              className="absolute h-px w-5 bg-ink"
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
                  <Link href={l.href} className="block py-3 font-serif text-2xl" onClick={() => setOpen(false)}>
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
