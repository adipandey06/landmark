"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { FillLayerSpecification, LineLayerSpecification } from "mapbox-gl";
import { useMapStore } from "@/lib/stores/map-store";
import { generateIsoMatchExpression } from "@/lib/utils/color-scales";
import { REGION_STATS } from "@/lib/mock-data/regions";

export function GridLayer() {
  const activePalette = useMapStore((s) => s.activePalette);

  const isoList = useMemo(() => [...REGION_STATS.keys()], []);

  const boundaryFillLayer: FillLayerSpecification = useMemo(() => ({
    id: "country-boundaries-fill",
    type: "fill",
    source: "mapbox-boundaries",
    "source-layer": "country_boundaries",
    filter: [
      "all",
      [
        "any",
        ["==", ["get", "worldview"], "all"],
        ["==", ["get", "worldview"], "US"]
      ]
    ],
    paint: {
      "fill-color": generateIsoMatchExpression(activePalette) as any,
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 0.7,
        4, 0.6,
        6, 0.2,
        8, 0
      ]
    }
  }), [activePalette]);

  const boundaryLineLayer: LineLayerSpecification = useMemo(() => ({
    id: "country-boundaries-line",
    type: "line",
    source: "mapbox-boundaries",
    "source-layer": "country_boundaries",
    filter: [
      "all",
      [
        "any",
        ["==", ["get", "worldview"], "all"],
        ["==", ["get", "worldview"], "US"]
      ]
    ],
    paint: {
      "line-color": [
        "match", ["get", "iso_3166_1"],
        isoList, "rgba(255,255,255,0.4)",
        "rgba(255,255,255,0.05)"
      ],
      "line-width": 1,
      "line-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 0.8,
        6, 0.3,
        8, 0
      ] as any,
    }
  }), [isoList]);

  // Always render — no gridVisible guard (country choropleth is always on)
  return (
    <Source
      id="mapbox-boundaries"
      type="vector"
      url="mapbox://mapbox.country-boundaries-v1"
    >
      <Layer {...boundaryFillLayer} />
      <Layer {...boundaryLineLayer} />
    </Source>
  );
}
