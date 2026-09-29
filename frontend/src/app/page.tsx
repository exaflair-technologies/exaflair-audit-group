import { Baseline } from "@/components/sections/baseline";
import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { Partners } from "@/components/sections/partners";
import { Process } from "@/components/sections/process";
import { Report } from "@/components/sections/report";
import { ThreatTicker } from "@/components/sections/threat-ticker";
import { Tiers } from "@/components/sections/tiers";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

// Partner logos come from Supabase; re-fetch at most every 5 minutes.
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ThreatTicker />
        <Tiers />
        <Partners />
        <Process />
        <Report />
        <Baseline />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
