"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { CircleLayerSpecification, SymbolLayerSpecification, HeatmapLayerSpecification } from "mapbox-gl";
import { sensorsToGeoJSON, STATUS_COLORS } from "@/lib/utils/geo";
import type { Sensor } from "@/lib/types";

interface SensorLayerProps {
  sensors: Sensor[];
}

function removeSensorOutliers(sensors: Sensor[]): Sensor[] {
  const byCountry = new Map<string, Sensor[]>();
  for (const sensor of sensors) {
    const arr = byCountry.get(sensor.country) ?? [];
    arr.push(sensor);
    byCountry.set(sensor.country, arr);
  }

  const cleaned: Sensor[] = [];

  for (const group of byCountry.values()) {
    if (group.length < 6) {
      cleaned.push(...group);
      continue;
    }

    const meanLat = group.reduce((acc, s) => acc + s.coordinates.lat, 0) / group.length;
    const meanLng = group.reduce((acc, s) => acc + s.coordinates.lng, 0) / group.length;

    const varLat =
      group.reduce((acc, s) => acc + (s.coordinates.lat - meanLat) ** 2, 0) /
      group.length;
    const varLng =
      group.reduce((acc, s) => acc + (s.coordinates.lng - meanLng) ** 2, 0) /
      group.length;

    const stdLat = Math.sqrt(varLat) || 1e-6;
    const stdLng = Math.sqrt(varLng) || 1e-6;

    for (const sensor of group) {
      const zLat = Math.abs((sensor.coordinates.lat - meanLat) / stdLat);
      const zLng = Math.abs((sensor.coordinates.lng - meanLng) / stdLng);

      // Remove sparse statistical outliers that look like random noise points.
      if (zLat > 2.6 || zLng > 2.6) continue;
      cleaned.push(sensor);
    }
  }

  return cleaned;
}

const HEATMAP_LAYER: HeatmapLayerSpecification = {
  id: "sensor-heatmap",
  type: "heatmap",
  source: "sensors",
  maxzoom: 12,
  paint: {
    "heatmap-weight": 1,
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 0.8,
      6, 1.6,
      12, 2.4
    ],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(0,0,255,0)",
      0.2, "rgba(33, 102, 172, 0.4)",
      0.4, "rgba(67, 147, 195, 0.6)",
      0.6, "rgba(146, 197, 222, 0.8)",
      0.8, "rgba(244, 165, 130, 0.9)",
      1, "rgba(178, 24, 43, 1)"
    ],
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 6,
      5, 14,
      12, 36
    ],
    "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      3, 0,
      5, 0.45,
      8, 0.9,
      10, 0.5,
      12, 0
    ],
  },
};

const sensorGlow: CircleLayerSpecification = {
  id: "sensor-glow",
  type: "circle",
  source: "sensors",
  filter: ["!", ["has", "point_count"]],
  minzoom: 10,
  paint: {
    "circle-radius": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      24,
      18,
    ],
    "circle-color": [
      "match",
      ["get", "status"],
      "online", "rgba(34, 197, 94, 0.55)",
      "warning", "rgba(234, 179, 8, 0.55)",
      "offline", "rgba(107, 114, 128, 0.5)",
      "critical", "rgba(239, 68, 68, 0.6)",
      "rgba(96,165,250,0.5)",
    ],
    "circle-blur": 0.92,
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      10, 0,
      11, 0.55,
      13, 0.4,
    ] as any,
  },
};

const sensorCircles: CircleLayerSpecification = {
  id: "sensor-circles",
  type: "circle",
  source: "sensors",
  filter: ["!", ["has", "point_count"]],
  minzoom: 10,
  paint: {
    "circle-radius": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      12,
      8,
    ],
    "circle-color": [
      "match",
      ["get", "status"],
      "online", STATUS_COLORS.online,
      "warning", STATUS_COLORS.warning,
      "offline", STATUS_COLORS.offline,
      "critical", STATUS_COLORS.critical,
      "#6b7280",
    ],
    "circle-stroke-color": [
      "match",
      ["get", "status"],
      "online", "rgba(34, 197, 94, 0.3)",
      "warning", "rgba(234, 179, 8, 0.3)",
      "offline", "rgba(107, 114, 128, 0.3)",
      "critical", "rgba(239, 68, 68, 0.3)",
      "rgba(0,0,0,0.6)",
    ],
    "circle-stroke-width": 4,
    "circle-blur": 0.18,
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      10, 0,
      11, 0.9
    ] as any,
  },
};

const sensorClusters: CircleLayerSpecification = {
  id: "sensor-clusters",
  type: "circle",
  source: "sensors",
  filter: ["has", "point_count"],
  minzoom: 8,
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "rgba(96, 165, 250, 0.8)",
      10, "rgba(59, 130, 246, 0.8)",
      30, "rgba(29, 78, 216, 0.8)",
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      20,
      10, 24,
      30, 28,
    ],
    "circle-stroke-color": "rgba(96, 165, 250, 0.3)",
    "circle-stroke-width": 6,
    "circle-blur": 0.35,
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      8, 0,
      9, 0.8,
      12, 1
    ] as any,
  },
};

const clusterCount: SymbolLayerSpecification = {
  id: "sensor-cluster-count",
  type: "symbol",
  source: "sensors",
  filter: ["has", "point_count"],
  minzoom: 8,
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 13,
    "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
  },
  paint: {
    "text-color": "#ffffff",
    "text-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      8, 0,
      9, 0.8,
      12, 1
    ] as any,
  },
};

export function SensorLayer({ sensors }: SensorLayerProps) {
  const denoisedSensors = useMemo(() => removeSensorOutliers(sensors), [sensors]);
  const geojson = useMemo(() => sensorsToGeoJSON(denoisedSensors), [denoisedSensors]);

  return (
    <Source
      id="sensors"
      type="geojson"
      data={geojson}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
      promoteId="id"
    >
      <Layer {...HEATMAP_LAYER} />
      <Layer {...sensorGlow} />
      <Layer {...sensorCircles} />
      <Layer {...sensorClusters} />
      <Layer {...clusterCount} />
    </Source>
  );
}
