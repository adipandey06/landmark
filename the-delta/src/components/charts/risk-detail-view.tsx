"use client";

import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VerificationBadge } from "@/components/verification/verification-badge";
import { ForecastChart } from "./forecast-chart";
import { CorrelationChart } from "./correlation-chart";
import { timeAgo } from "@/lib/utils/format";
import { useAnalysisSummary } from "@/hooks/use-analysis-summary";
import type { RiskAssessment } from "@/lib/types";

const riskLevelColors: Record<string, string> = {
  low: "text-green-600",
  moderate: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

interface RiskDetailViewProps {
  risk: RiskAssessment;
  onClose: () => void;
}

export function RiskDetailView({ risk, onClose }: RiskDetailViewProps) {
  const { data: aiSummary, isLoading: aiLoading, isError: aiError } = useAnalysisSummary(risk.sensorId);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                risk.level === "critical"
                  ? "destructive"
                  : risk.level === "high"
                    ? "default"
                    : "secondary"
              }
            >
              {risk.level}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              Score: {risk.score}/100
            </span>
          </div>
          <CardTitle className="mt-2 text-base">{risk.title}</CardTitle>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {risk.sensorName} &middot; Assessed {timeAgo(risk.assessedAt)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            AI Narrative
          </h4>
          {aiLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating AI analysis...
            </div>
          ) : aiError || !aiSummary ? (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
              {risk.narrative.split("\n\n").map((p, i) => (
                <p key={i} className="mb-3">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{aiSummary.summary}</p>
              <p><span className="font-medium text-foreground">Trend:</span> {aiSummary.trend_explanation}</p>
              <p><span className="font-medium text-foreground">Anomalies:</span> {aiSummary.anomaly_note}</p>
              <p><span className="font-medium text-foreground">Recommendation:</span> {aiSummary.recommendation}</p>
              <p className="font-mono text-xs">
                AI Risk Level:{" "}
                <span className={`font-semibold uppercase ${riskLevelColors[aiSummary.risk_level] ?? ""}`}>
                  {aiSummary.risk_level}
                </span>
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Risk Forecast
            </h4>
            <ForecastChart data={risk.forecast} />
          </div>
          <div>
            <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Correlation Factors
            </h4>
            <CorrelationChart data={risk.correlations} />
          </div>
        </div>

        <Separator />

        <VerificationBadge
          txSignature={risk.txSignature}
          hash={risk.dataHash}
          status="verified"
          size="md"
          showHash
        />
      </CardContent>
    </Card>
  );
}
