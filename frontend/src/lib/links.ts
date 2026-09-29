const MAIN_SITE = "https://exaflair.com";

/** Main-nav entries, mirroring exaflair.com. */
export const navLinks = [
  { label: "Why us", href: `${MAIN_SITE}/#why-us` },
  { label: "Services", href: `${MAIN_SITE}/services` },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Join us", href: `${MAIN_SITE}/careers` },
] as const;

export const bookCallHref = `${MAIN_SITE}/#contact`;

export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/exaflair-technologies" },
  { label: "X", href: "https://x.com/exaflair" },
  { label: "Instagram", href: "https://www.instagram.com/exaflair.tech" },
] as const;
