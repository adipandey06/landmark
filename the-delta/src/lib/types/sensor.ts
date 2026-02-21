import type { Coordinates, Region, SensorStatus } from "./common";

export type SensorType =
  | "water-quality"
  | "flow-rate"
  | "pressure"
  | "level"
  | "turbidity"
  | "soil-moisture"
  | "soil-temperature"
  | "soil-ph"
  | "conductivity";

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  region: Region;
  country: string;
  coordinates: Coordinates;
  installedAt: string;
  lastReading: string;
  metrics: SensorMetrics;
  txSignature: string;
  dataHash: string;
}

export interface SensorMetrics {
  ph: number;
  turbidity: number;
  dissolvedOxygen: number;
  temperature: number;
  flowRate: number;
  pressure: number;
  soilMoisture?: number;
  soilTemperature?: number;
  soilPh?: number;
  electricalConductivity?: number;
}

export interface SensorReading {
  timestamp: string;
  value: number;
  metric: string;
}

export interface SensorFilter {
  region?: Region;
  status?: SensorStatus;
  type?: SensorType;
  search?: string;
}
