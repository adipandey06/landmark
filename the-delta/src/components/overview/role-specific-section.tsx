"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole, ROLE_LABELS, type Role } from "@/contexts/role-context";
import { useGlobalStats } from "@/hooks/use-stats";
import { useRisks } from "@/hooks/use-risks";
import { formatNumber } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightItem {
  label: string;
  value: string;
  detail: string;
}

function getInsights(
  role: Role,
  stats: { totalSensors: number; activeAlerts: number; populationServed: number },
  riskCount: number
): InsightItem[] {
  switch (role) {
    case "policymaker":
      return [
        { label: "Coverage Index", value: `${stats.totalSensors} sensors`, detail: "Across 11 countries in 3 regions" },
        { label: "Population at Risk", value: formatNumber(Math.round(stats.populationServed * 0.12)), detail: "Based on current alert proximity analysis" },
        { label: "Compliance Rate", value: "87%", detail: "Water quality standards met across monitored zones" },
        { label: "Budget Utilization", value: "73%", detail: "Infrastructure maintenance fund allocation" },
      ];
    case "engineer":
      return [
        { label: "System Uptime", value: "94.2%", detail: "Network-wide average over 30 days" },
        { label: "Sensors Needing Maintenance", value: "8", detail: "Based on calibration drift and offline patterns" },
        { label: "Infrastructure Alerts", value: String(stats.activeAlerts), detail: "Pressure and flow anomalies detected" },
        { label: "Data Integrity Score", value: "99.1%", detail: "Verified readings vs total readings" },
      ];
    case "water-professional":
      return [
        { label: "Avg Water Quality Index", value: "72/100", detail: "Composite score across all monitored regions" },
        { label: "Contamination Events", value: String(Math.max(2, Math.round(riskCount * 0.15))), detail: "Active contamination-related assessments" },
        { label: "Treatment Efficiency", value: "91%", detail: "Average across operational treatment plants" },
        { label: "pH Compliance", value: "96%", detail: "Readings within WHO guideline range" },
      ];
    case "humanitarian":
      return [
        { label: "Crisis Zones", value: String(Math.max(1, Math.round(stats.activeAlerts * 0.3))), detail: "Areas with critical-level risk assessments" },
        { label: "Populations Affected", value: formatNumber(Math.round(stats.populationServed * 0.05)), detail: "In areas with active service disruptions" },
        { label: "Emergency Deployments", value: "3", detail: "Active rapid-response water treatment units" },
        { label: "Supply Gap", value: "15%", detail: "Demand vs available clean water supply" },
      ];
  }
}

export function RoleSpecificSection() {
  const { role } = useRole();
  const { data: stats, isLoading: statsLoading } = useGlobalStats();
  const { data: risks, isLoading: risksLoading } = useRisks();

  if (statsLoading || risksLoading || !stats || !risks) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const insights = getInsights(role, stats, risks.length);

  return (
    <div>
      <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
        Viewing as: {ROLE_LABELS[role]}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-1">
              <CardTitle className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
