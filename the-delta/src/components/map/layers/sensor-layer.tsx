"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { CircleLayerSpecification, SymbolLayerSpecification } from "mapbox-gl";
import { sensorsToGeoJSON, STATUS_COLORS } from "@/lib/utils/geo";
import type { Sensor } from "@/lib/types";

interface SensorLayerProps {
  sensors: Sensor[];
}

const sensorCircles: CircleLayerSpecification = {
  id: "sensor-circles",
  type: "circle",
  source: "sensors",
  slot: "top",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-radius": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      10,
      7,
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
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
    "circle-opacity": 1,
  },
};

const sensorClusters: CircleLayerSpecification = {
  id: "sensor-clusters",
  type: "circle",
  source: "sensors",
  slot: "top",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#60a5fa", // < 10
      10, "#3b82f6", // 10–29
      30, "#1d4ed8", // 30+
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      18, // < 10
      10, 20, // 10–29
      30, 24, // 30+
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
};

const clusterCount: SymbolLayerSpecification = {
  id: "sensor-cluster-count",
  type: "symbol",
  source: "sensors",
  slot: "top",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12,
    "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
  },
  paint: {
    "text-color": "#ffffff",
  },
};

export function SensorLayer({ sensors }: SensorLayerProps) {
  const geojson = useMemo(() => sensorsToGeoJSON(sensors), [sensors]);

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
      <Layer {...sensorCircles} />
      <Layer {...sensorClusters} />
      <Layer {...clusterCount} />
    </Source>
  );
}
