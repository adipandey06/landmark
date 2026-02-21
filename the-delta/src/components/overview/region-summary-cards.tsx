"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegionStats } from "@/hooks/use-stats";
import { REGION_LABELS } from "@/lib/types";
import { StatsGridSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/shared/error-state";

export function RegionSummaryCards() {
  const { data, isLoading, isError, refetch } = useRegionStats();

  if (isLoading) return <StatsGridSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {data.map((region) => (
        <Card key={region.region}>
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-widest">
              {REGION_LABELS[region.region]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Sensors" value={region.sensorCount} />
              <Stat label="Avg Risk" value={region.avgRiskScore} suffix="/100" />
              <Stat label="Alerts" value={region.alertCount} />
              <Stat label="Online" value={region.onlinePercentage} suffix="%" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-bold">
        {value}
        {suffix && (
          <span className="text-xs font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
