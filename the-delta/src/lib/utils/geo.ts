import type { Sensor } from "@/lib/types";

export interface SensorGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: {
      id: string;
      name: string;
      status: string;
      type: string;
      region: string;
      country: string;
    };
  }>;
}

export function sensorsToGeoJSON(sensors: Sensor[]): SensorGeoJSON {
  return {
    type: "FeatureCollection",
    features: sensors.map((sensor) => ({
      type: "Feature" as const,
      id: sensor.id,
      geometry: {
        type: "Point" as const,
        coordinates: [sensor.coordinates.lng, sensor.coordinates.lat],
      },
      properties: {
        id: sensor.id,
        name: sensor.name,
        status: sensor.status,
        type: sensor.type,
        region: sensor.region,
        country: sensor.country,
      },
    })),
  };
}

export const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  warning: "#eab308",
  offline: "#6b7280",
  critical: "#ef4444",
};
