"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { useMapStore } from "@/lib/stores/map-store";

export function SatelliteLayers() {
  const satelliteLayers = useMapStore((s) => s.satelliteLayers);
  const today = new Date().toISOString().split("T")[0];

  const visibleLayers = satelliteLayers.filter((l) => l.visible);

  if (visibleLayers.length === 0) return null;

  return (
    <>
      {visibleLayers.map((layer) => (
        <Source
          key={layer.id}
          id={`satellite-${layer.id}`}
          type="raster"
          tiles={[layer.sourceUrl.replace("{Date}", today)]}
          tileSize={256}
        >
          <Layer
            id={`satellite-layer-${layer.id}`}
            type="raster"
            slot="bottom"
            paint={{ "raster-opacity": layer.opacity }}
          />
        </Source>
      ))}
    </>
  );
}
