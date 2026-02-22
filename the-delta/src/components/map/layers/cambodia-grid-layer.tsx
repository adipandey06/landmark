"use client";

import { useEffect, useMemo, useState } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { CircleLayerSpecification, Feature, FeatureCollection, HeatmapLayerSpecification, Point } from "mapbox-gl";
import { useMapStore } from "@/lib/stores/map-store";

const METRIC_CONFIGS: Record<string, { label: string; colors: string[]; domain: number[]; heatmapWeight: unknown[] }> = {
  riskLevel: {
    label: "Risk Level",
    colors: ["#52b788", "#f9c74f", "#f3722c", "#e63946"], // Low -> Critical
    domain: [1, 2, 3, 4], // We will map the string to integer in the layer case
    heatmapWeight: [
      "match", ["get", "riskLevel"],
      "Low", 0.2,
      "Medium", 0.5,
      "High", 0.8,
      "Critical", 1.0,
      0
    ],
  },
  ph: {
    label: "Soil pH",
    colors: ["#d62828", "#fcbf49", "#a7c957", "#219ebc", "#023e8a"], // Acidic -> Neutral -> Basic
    domain: [4.0, 5.5, 6.5, 7.5, 8.5],
    heatmapWeight: ["interpolate", ["linear"], ["get", "ph"], 4.0, 1, 6.5, 0.2, 8.5, 1], // Weight extremes higher
  },
  temperature: {
    label: "Temperature (°C)",
    colors: ["#0077b6", "#90e0ef", "#f9c74f", "#f77f00", "#d62828"], // Cool -> Hot
    domain: [20, 25, 30, 35, 40],
    heatmapWeight: ["interpolate", ["linear"], ["get", "temperature"], 20, 0, 40, 1],
  },
  humidity: {
    label: "Humidity (%)",
    colors: ["#e07a5f", "#f2cc8f", "#81b29a", "#3d405b", "#2b2d42"], // Dry -> Wet
    domain: [40, 60, 75, 85, 95],
    heatmapWeight: ["interpolate", ["linear"], ["get", "humidity"], 40, 0, 100, 1],
  },
  ndvi: {
    label: "NDVI (Vegetation Index)",
    colors: ["#e9c46a", "#f4a261", "#e76f51", "#2a9d8f", "#264653"],
    domain: [0.0, 0.2, 0.4, 0.6, 0.8],
    heatmapWeight: ["interpolate", ["linear"], ["get", "ndvi"], 0, 0, 1, 1],
  },
  soilMoisture: {
    label: "Soil Moisture (%)",
    colors: ["#d4a373", "#e9c46a", "#2a9d8f", "#219ebc", "#023e8a"],
    domain: [0, 20, 40, 60, 80],
    heatmapWeight: ["interpolate", ["linear"], ["get", "soilMoisture"], 0, 0, 100, 1],
  }
};

export function CambodiaGridLayer() {
  const gridVisible = useMapStore((s) => s.gridVisible);
  const gridMetric = useMapStore((s) => s.gridMetric);
  const [rawData, setRawData] = useState<FeatureCollection<Point> | null>(null);

  const config = METRIC_CONFIGS[gridMetric] || METRIC_CONFIGS["riskLevel"];

  useEffect(() => {
    let active = true;
    fetch("/cambodia_grid.json")
      .then((r) => r.json())
      .then((data: FeatureCollection<Point>) => {
        if (active) setRawData(data);
      })
      .catch(() => {
        if (active) setRawData(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const convolvedData = useMemo(() => {
    if (!rawData) return null;

    const CELL_SIZE = 0.04; // aligns with generated grid spacing
    const RISK_TO_NUM: Record<string, number> = {
      Low: 1,
      Medium: 2,
      High: 3,
      Critical: 4,
    };

    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ];

    const cells = new Map<string, { gx: number; gy: number; sum: number; count: number }>();

    for (const feature of rawData.features) {
      if (feature.geometry?.type !== "Point") continue;
      const [lon, lat] = feature.geometry.coordinates;
      const props = (feature.properties ?? {}) as Record<string, unknown>;

      let v: number | null = null;
      if (gridMetric === "riskLevel") {
        const risk = String(props.riskLevel ?? "");
        v = RISK_TO_NUM[risk] ?? null;
      } else {
        const candidate = Number(props[gridMetric]);
        v = Number.isFinite(candidate) ? candidate : null;
      }
      if (v == null) continue;

      const gx = Math.floor(lon / CELL_SIZE);
      const gy = Math.floor(lat / CELL_SIZE);
      const key = `${gx}:${gy}`;

      const existing = cells.get(key);
      if (existing) {
        existing.sum += v;
        existing.count += 1;
      } else {
        cells.set(key, { gx, gy, sum: v, count: 1 });
      }
    }

    const out: Feature<Point>[] = [];
    for (const cell of cells.values()) {
      let weighted = 0;
      let wSum = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const n = cells.get(`${cell.gx + dx}:${cell.gy + dy}`);
          if (!n) continue;
          const w = kernel[dy + 1][dx + 1];
          const avg = n.sum / n.count;
          weighted += avg * w;
          wSum += w;
        }
      }

      if (wSum === 0) continue;
      const smooth = weighted / wSum;
      const centerLon = (cell.gx + 0.5) * CELL_SIZE;
      const centerLat = (cell.gy + 0.5) * CELL_SIZE;

      out.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [centerLon, centerLat],
        },
        properties: {
          smooth,
          density: cell.count,
        },
      });
    }

    return {
      type: "FeatureCollection",
      features: out,
    } as FeatureCollection<Point>;
  }, [rawData, gridMetric]);

  const domainMin = config.domain[0] ?? 0;
  const domainMax = config.domain[config.domain.length - 1] ?? 1;

  const convolvedWeightExpr = useMemo(() => ([
    "interpolate",
    ["linear"],
    ["get", "smooth"],
    domainMin, 0,
    domainMax, 1,
  ] as any), [domainMin, domainMax]);

  // Convolved gradient layer for zoomed-out view
  const convolvedGradientLayer: HeatmapLayerSpecification = useMemo(() => ({
    id: "cambodia-grid-convolved-gradient",
    type: "heatmap",
    source: "cambodia-grid-convolved-source",
    maxzoom: 9,
    paint: {
      "heatmap-weight": convolvedWeightExpr,
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 0.8,
        5, 1.5,
        9, 2.2,
      ],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0.0, "rgba(0,0,0,0)",
        0.2, config.colors[0],
        0.4, config.colors[1],
        0.6, config.colors[2],
        0.8, config.colors[3],
        1.0, config.colors[config.colors.length - 1] ?? config.colors[3],
      ],
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 8,
        5, 18,
        9, 30,
      ],
      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 0.15,
        4, 0.45,
        8, 0.7,
        9, 0,
      ],
    },
  }), [config, convolvedWeightExpr]);

  // Circle layer for zoomed-in view
  const circleColorExpr = useMemo(() => {
    if (gridMetric === "riskLevel") {
      return [
        "match", ["get", "riskLevel"],
        "Low", config.colors[0],
        "Medium", config.colors[1],
        "High", config.colors[2],
        "Critical", config.colors[3],
        config.colors[0]
      ];
    }
    
    // Smooth interpolation for numeric values
    const expr: any[] = ["interpolate", ["linear"], ["get", gridMetric]];
    for (let i = 0; i < config.domain.length; i++) {
        expr.push(config.domain[i], config.colors[i]);
    }
    return expr;
  }, [gridMetric, config]);

  const circleLayer: CircleLayerSpecification = useMemo(() => ({
    id: "cambodia-grid-circles",
    type: "circle",
    source: "cambodia-grid-raw",
    minzoom: 7,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 2,
        12, 6,
        22, 18
      ],
      "circle-color": circleColorExpr as any,
      "circle-stroke-color": "rgba(0,0,0,0.4)",
      "circle-stroke-width": 1,
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0,
        9, 0.8
      ],
      "circle-stroke-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0,
        9, 1
      ]
    }
  }), [circleColorExpr]);

  if (!gridVisible) return null;

  return (
    <>
      {convolvedData && (
        <Source
          id="cambodia-grid-convolved-source"
          type="geojson"
          data={convolvedData}
        >
          <Layer {...convolvedGradientLayer} />
        </Source>
      )}

      <Source
        id="cambodia-grid-raw"
        type="geojson"
        data="/cambodia_grid.json"
      >
        <Layer {...circleLayer} />
      </Source>
    </>
  );
}

export { METRIC_CONFIGS };
