"use client";

import { SatelliteHero } from "@/components/satellite/satellite-hero";
import { FusionScoreCards } from "@/components/satellite/fusion-score-cards";
import { CoverageAnalysis } from "@/components/satellite/coverage-analysis";
import { SoilMoistureDashboard } from "@/components/satellite/soil-moisture-dashboard";
import { GapAnalysisTimeline } from "@/components/satellite/gap-analysis-timeline";

export default function SatellitePage() {
  return (
    <div className="space-y-8 p-6 md:p-8">
      <SatelliteHero />
      <FusionScoreCards />
      <CoverageAnalysis />
      <SoilMoistureDashboard />
      <GapAnalysisTimeline />
    </div>
  );
}
