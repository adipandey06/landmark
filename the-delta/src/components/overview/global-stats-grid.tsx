"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalStats } from "@/hooks/use-stats";
import { formatNumber } from "@/lib/utils/format";
import { StatsGridSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/shared/error-state";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Activity, AlertTriangle, Globe, Users } from "lucide-react";

const STAT_CONFIG = [
  { key: "totalSensors", label: "Total Sensors", icon: Activity, sparklineKey: "sensors" },
  { key: "activeAlerts", label: "Active Alerts", icon: AlertTriangle, sparklineKey: "alerts" },
  { key: "countriesMonitored", label: "Countries", icon: Globe, sparklineKey: "countries" },
  { key: "populationServed", label: "Population Served", icon: Users, sparklineKey: "population" },
] as const;

export function GlobalStatsGrid() {
  const { data, isLoading, isError, refetch } = useGlobalStats();

  if (isLoading) return <StatsGridSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((cfg) => {
        const value = data[cfg.key];
        const sparkline = data.sparklines[cfg.sparklineKey].map((v, i) => ({
          i,
          v,
        }));
        const Icon = cfg.icon;

        return (
          <Card key={cfg.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {cfg.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(value)}</div>
              <div className="mt-2 h-10">
                <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={100}>
                  <AreaChart data={sparkline}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.1}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
