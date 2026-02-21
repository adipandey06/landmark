"use client";

import { SectionHeading } from "@/components/layout/section-heading";
import { HeroSection } from "@/components/overview/hero-section";
import { GlobalStatsGrid } from "@/components/overview/global-stats-grid";
import { RecentAdvisories } from "@/components/overview/recent-advisories";
import { RegionSummaryCards } from "@/components/overview/region-summary-cards";
import { RoleSpecificSection } from "@/components/overview/role-specific-section";
import { VerificationSummary } from "@/components/overview/verification-summary";

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
          title="Recent Advisories"
          subtitle="Latest AI-generated risk assessments"
        />
        <RecentAdvisories />
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
          title="Role Insights"
          subtitle="Tailored intelligence for your role"
        />
        <RoleSpecificSection />
      </section>

      <section>
        <SectionHeading
          number="05"
          title="Verification Status"
          subtitle="Blockchain-anchored data integrity"
        />
        <VerificationSummary />
      </section>
    </div>
  );
}
