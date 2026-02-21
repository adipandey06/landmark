import { Card, CardContent } from "@/components/ui/card";
import type { RiskAssessment } from "@/lib/types";

interface RiskOverviewBarProps {
  risks: RiskAssessment[];
}

export function RiskOverviewBar({ risks }: RiskOverviewBarProps) {
  const critical = risks.filter((r) => r.level === "critical").length;
  const high = risks.filter((r) => r.level === "high").length;
  const avg = risks.length
    ? Math.round(risks.reduce((s, r) => s + r.score, 0) / risks.length)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Total Assessments" value={risks.length} />
      <StatCard label="Critical" value={critical} className="text-red-500" />
      <StatCard label="High" value={high} className="text-orange-500" />
      <StatCard label="Avg Score" value={`${avg}/100`} />
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={`text-2xl font-bold ${className ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
