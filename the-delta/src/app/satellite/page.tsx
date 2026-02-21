"use client";

import { SatelliteHero } from "@/components/satellite/satellite-hero";
import { FusionScoreCards } from "@/components/satellite/fusion-score-cards";
import { CoverageAnalysis } from "@/components/satellite/coverage-analysis";
import { SoilMoistureDashboard } from "@/components/satellite/soil-moisture-dashboard";
import { GapAnalysisTimeline } from "@/components/satellite/gap-analysis-timeline";
import { InfoBanner } from "@/components/layout/info-banner";

export default function SatellitePage() {
  return (
    <div className="space-y-8 p-6 md:p-8">
      <InfoBanner>
        While our ground sensors show what's happening in specific spots, this view uses NASA satellites to look at the big picture from space. By comparing the "bird's eye view" from satellites with our on-the-ground sensors, we can double-check our accuracy and spot large-scale trends across entire regions safely.
      </InfoBanner>
      <SatelliteHero />
      <FusionScoreCards />
      <CoverageAnalysis />
      <SoilMoistureDashboard />
      <GapAnalysisTimeline />
    </div>
  );
}
