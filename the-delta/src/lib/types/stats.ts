import type { Region } from "./common";

export interface GlobalStats {
  totalSensors: number;
  activeAlerts: number;
  countriesMonitored: number;
  populationServed: number;
  sparklines: {
    sensors: number[];
    alerts: number[];
    countries: number[];
    population: number[];
  };
}

export interface RegionStats {
  region: Region;
  sensorCount: number;
  avgRiskScore: number;
  alertCount: number;
  onlinePercentage: number;
}

export interface DashboardInsights {
  overview: string;
  urgent_region: string;
  patterns: string;
  focus_areas: string[];
  generated_at: string;
  source?: "ai" | "fallback";
}
