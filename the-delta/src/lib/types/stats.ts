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
