"use client";

import Link from "next/link";
import { useRisks } from "@/hooks/use-risks";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskLevel } from "@/lib/types";

const RISK_DOT_COLOR: Record<RiskLevel, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export function RecentAdvisories() {
  const { data, isLoading, isError, refetch } = useRisks({
    sortBy: "assessedAt",
    sortOrder: "desc",
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const recent = data.slice(0, 5);

  return (
    <div className="space-y-2">
      {recent.map((risk) => (
        <Link
          key={risk.id}
          href="/risk"
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-accent/50"
        >
          <span
            className={cn("h-2.5 w-2.5 shrink-0 rounded-full", RISK_DOT_COLOR[risk.level])}
            aria-label={`Risk level: ${risk.level}`}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{risk.title}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {risk.sensorName} &middot; {risk.region.replace(/-/g, " ")}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {timeAgo(risk.assessedAt)}
          </span>
        </Link>
      ))}
    </div>
  );
}
