"use client";

import { SectionHeading } from "@/components/layout/section-heading";
import { HeroSection } from "@/components/overview/hero-section";
import { GlobalStatsGrid } from "@/components/overview/global-stats-grid";
import { RiskTrendsChart } from "@/components/overview/risk-trends-chart";
import { RegionSummaryCards } from "@/components/overview/region-summary-cards";
import { VerificationSummary } from "@/components/overview/verification-summary";
import { InfoBanner } from "@/components/layout/info-banner";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <HeroSection />

      <section>
        <SectionHeading
          number="01"
          title="Global Overview"
          subtitle="Real-time infrastructure metrics"
        />
        <GlobalStatsGrid />
      </section>

      <section>
        <SectionHeading
          number="02"
          title="Data Analytics"
          subtitle="Aggregated risk trends over time"
        />
        <RiskTrendsChart />
      </section>

      <section>
        <SectionHeading
          number="03"
          title="Regional Summary"
          subtitle="Performance across monitoring regions"
        />
        <RegionSummaryCards />
      </section>

      <section>
        <SectionHeading
          number="04"
          title="Verification Status"
          subtitle="Blockchain-anchored data integrity"
        />
        <VerificationSummary />
      </section>
    </div>
  );
}
