import { Baseline } from "@/components/sections/baseline";
import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Report } from "@/components/sections/report";
import { ThreatTicker } from "@/components/sections/threat-ticker";
import { Tiers } from "@/components/sections/tiers";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

export default function Home() {
  return (
    <>
      <Navbar overlay />
      <main className="flex-1">
        <Hero />
        <ThreatTicker />
        <Tiers />
        <Process />
        <Report />
        <Baseline />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
