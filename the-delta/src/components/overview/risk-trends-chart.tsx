"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useRisks } from "@/hooks/use-risks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { format } from "date-fns";

export function RiskTrendsChart() {
  const { data: risks, isLoading, isError, refetch } = useRisks({
    sortBy: "assessedAt",
    sortOrder: "asc", 
  });

  const chartData = useMemo(() => {
    if (!risks) return [];
    
    // Group and average risk scores by date
    const dateMap = new Map<string, { sum: number; count: number }>();
    
    risks.forEach((risk) => {
      const dateStr = format(new Date(risk.assessedAt), "MMM dd");
      const current = dateMap.get(dateStr) || { sum: 0, count: 0 };
      dateMap.set(dateStr, {
        sum: current.sum + risk.score,
        count: current.count + 1,
      });
    });

    return Array.from(dateMap.entries()).map(([date, { sum, count }]) => ({
      date,
      averageScore: Math.round(sum / count),
    }));
  }, [risks]);


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Risk Analysis Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !risks) return <ErrorState onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Risk Analysis Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  fontSize: 12,
                  fontFamily: "var(--font-geist-mono)",
                  borderRadius: 8,
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Area 
                type="monotone" 
                dataKey="averageScore" 
                name="Avg Risk Score"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
