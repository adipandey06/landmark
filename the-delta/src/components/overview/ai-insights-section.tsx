"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardInsights } from "@/hooks/use-dashboard-insights";

function InsightsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

function FallbackInsights() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-xs uppercase tracking-widest">
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          AI-generated insights are temporarily unavailable. The system monitors
          water and soil infrastructure across Sub-Saharan Africa, South Asia,
          and Southeast Asia. Check back shortly for an updated analysis.
        </p>
      </CardContent>
    </Card>
  );
}

export function AiInsightsSection() {
  const { data, isLoading, isError } = useDashboardInsights();

  if (isLoading) return <InsightsSkeleton />;
  if (isError || !data) return <FallbackInsights />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-xs uppercase tracking-widest">
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Overview
          </p>
          <p className="text-sm leading-relaxed">{data.overview}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Urgent Region
          </p>
          <Badge variant="destructive">{data.urgent_region}</Badge>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Cross-Regional Patterns
          </p>
          <p className="text-sm leading-relaxed">{data.patterns}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Focus Areas
          </p>
          <ul className="list-disc list-inside space-y-1">
            {data.focus_areas.map((area, i) => (
              <li key={i} className="text-sm">{area}</li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground">
          {data.source === "fallback"
            ? "Based on historical analysis"
            : `Generated ${new Date(data.generated_at).toLocaleString()}`}
        </p>
      </CardContent>
    </Card>
  );
}
