"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/layout/section-heading";
import { RiskOverviewBar } from "@/components/charts/risk-overview-bar";
import { RiskTable } from "@/components/charts/risk-table";
import { RiskDetailView } from "@/components/charts/risk-detail-view";
import { RiskFilterBar } from "@/components/charts/risk-filter-bar";
import { useRisks } from "@/hooks/use-risks";
import { ErrorState } from "@/components/shared/error-state";
import { StatsGridSkeleton } from "@/components/skeletons";
import type { RiskAssessment, RiskFilter } from "@/lib/types";

export default function RiskPage() {
  const [filter, setFilter] = useState<RiskFilter>({
    sortBy: "score",
    sortOrder: "desc",
  });
  const [selected, setSelected] = useState<RiskAssessment | null>(null);
  const { data: risks, isLoading, isError, refetch } = useRisks(filter);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <SectionHeading
        number="03"
        title="AI Risk & Forecast"
        subtitle="Machine learning-driven risk assessments with confidence-banded forecasts"
      />

      {isLoading ? (
        <StatsGridSkeleton />
      ) : isError || !risks ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <RiskOverviewBar risks={risks} />
          <RiskFilterBar filter={filter} onFilterChange={setFilter} />
          <RiskTable
            risks={risks}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
          {selected && (
            <RiskDetailView
              risk={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
