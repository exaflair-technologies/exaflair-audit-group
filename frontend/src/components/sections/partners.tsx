/* eslint-disable @next/next/no-img-element -- plain <img> keeps SVG logos crisp and works with Supabase storage URLs */
import { listPartners, type Partner } from "@/server/services/partners.service";

/** Single row of partner logos scrolling continuously; pauses on hover. Logos come from the `partners` table. */
export async function Partners() {
  let partners: Partner[];
  try {
    partners = await listPartners();
  } catch {
    return null; // the strip is decorative — hide it rather than break the page
  }
  if (partners.length === 0) return null;

  return (
    <section aria-labelledby="partners-heading" className="py-16 sm:py-20">
      <p
        id="partners-heading"
        className="mb-10 text-center font-mono text-xs tracking-[0.2em] text-muted uppercase"
      >
        Partners
      </p>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className="partners-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          {[...partners, ...partners].map((p, i) => {
            const logo = (
              <img
                src={p.logoUrl}
                alt={p.name}
                className="h-7 w-auto opacity-50 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-8"
              />
            );
            return (
              <li key={`${p.id}-${i}`} aria-hidden={i >= partners.length} className="shrink-0 px-8 sm:px-12">
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
