import type { Region, RiskLevel } from "./common";

export type RiskCategory =
  | "contamination"
  | "infrastructure-failure"
  | "drought"
  | "flooding"
  | "supply-disruption"
  | "soil-degradation"
  | "salinity-intrusion"
  | "nutrient-depletion";

export interface RiskAssessment {
  id: string;
  sensorId: string;
  sensorName: string;
  region: Region;
  level: RiskLevel;
  score: number;
  category: RiskCategory;
  title: string;
  narrative: string;
  forecast: ForecastPoint[];
  correlations: Correlation[];
  assessedAt: string;
  txSignature: string;
  dataHash: string;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface Correlation {
  factor: string;
  value: number;
  direction: "positive" | "negative";
}

export interface RiskFilter {
  level?: RiskLevel;
  category?: RiskCategory;
  region?: Region;
  sortBy?: "score" | "assessedAt" | "level";
  sortOrder?: "asc" | "desc";
}

export interface AiSummary {
  summary: string;
  trend_explanation: string;
  anomaly_note: string;
  recommendation: string;
  risk_level: "low" | "moderate" | "high" | "critical";
}
