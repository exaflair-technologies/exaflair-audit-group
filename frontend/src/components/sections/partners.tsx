/* eslint-disable @next/next/no-img-element -- plain <img> keeps SVG logos crisp */
import { partners } from "@/data/partners";

/** Single row of partner logos scrolling continuously; pauses on hover. Logos come from `@/data/partners`. */
export function Partners() {
  if (partners.length === 0) return null;

  return (
    <section aria-labelledby="partners-heading" className="py-12 sm:py-14">
      <p
        id="partners-heading"
        className="mb-10 text-center font-medium text-xs tracking-[0.2em] text-muted uppercase"
      >
        Brands we&apos;ve worked with
      </p>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className="partners-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          {[...partners, ...partners].map((p, i) => {
            const logo = (
              <img
                src={p.logoUrl}
                alt={p.name}
                className={`w-auto rounded-md transition duration-300 hover:scale-105 ${
                  p.shape === "square" ? "h-12 sm:h-14" : "h-7 sm:h-8"
                }`}
              />
            );
            return (
              <li key={`${p.name}-${i}`} aria-hidden={i >= partners.length} className="shrink-0 px-8 sm:px-12">
                {p.websiteUrl ? (
                  <a href={p.websiteUrl} target="_blank" rel="noreferrer" tabIndex={i >= partners.length ? -1 : 0}>
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
