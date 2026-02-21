export interface SatelliteLayer {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  opacity: number;
  visible: boolean;
}

export interface DataCoverageStats {
  region: string;
  satelliteCoveragePct: number;
  sensorCoveragePct: number;
  fusedCoveragePct: number;
  gapDays: number;
  sensorFilledDays: number;
}

export interface FusionScore {
  label: string;
  satelliteOnlyAccuracy: number;
  fusedAccuracy: number;
  improvement: number;
  metric: string;
}

export interface DailyCoverage {
  date: string;
  hasSatellite: boolean;
  hasSensor: boolean;
  cloudCoverPct: number;
}
