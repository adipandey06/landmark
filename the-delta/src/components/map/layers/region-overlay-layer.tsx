"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import type { FillLayerSpecification, LineLayerSpecification } from "mapbox-gl";
import { useMapStore } from "@/lib/stores/map-store";
import { generateStepExpression } from "@/lib/utils/color-scales";
import { REGION_OVERLAYS } from "@/lib/mock-data/region-overlays";

export function RegionOverlayLayer() {
  const overlayVisible = useMapStore((s) => s.overlayVisible);
  const overlayOpacity = useMapStore((s) => s.overlayOpacity);
  const activePalette = useMapStore((s) => s.activePalette);

  if (!overlayVisible) return null;

  const fillLayer: FillLayerSpecification = {
    id: "region-overlay-fill",
    type: "fill",
    source: "region-overlays",
    paint: {
      "fill-color": generateStepExpression("score", activePalette),
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3, 0,
        5, 0.3,
        7, overlayOpacity,
        10, 0.18,
        12, 0,
      ] as any,
      "fill-outline-color": "rgba(255,255,255,0.12)",
    },
  };

  const lineLayer: LineLayerSpecification = {
    id: "region-overlay-line",
    type: "line",
    source: "region-overlays",
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "rgba(255,255,255,0.6)",
        "rgba(255,255,255,0.2)",
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        2.5,
        1,
      ],
      "line-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3, 0,
        5, 0.5,
        7, 1,
        10, 0.3,
        12, 0,
      ] as any,
    },
  };

  return (
    <Source
      id="region-overlays"
      type="geojson"
      data={REGION_OVERLAYS}
      promoteId="id"
    >
      <Layer {...fillLayer} />
      <Layer {...lineLayer} />
    </Source>
  );
}
