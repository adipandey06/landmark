export interface Coordinates {
  lat: number;
  lng: number;
}

export type Region = "sub-saharan-africa" | "south-asia" | "southeast-asia";

export const REGION_LABELS: Record<Region, string> = {
  "sub-saharan-africa": "Sub-Saharan Africa",
  "south-asia": "South Asia",
  "southeast-asia": "Southeast Asia",
};

export type SensorStatus = "online" | "warning" | "offline" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
