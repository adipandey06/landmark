"use client";

import { useMap } from "react-map-gl/mapbox";
import { Plus, Minus, Compass, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapStore, INITIAL_VIEW } from "@/lib/stores/map-store";

export function MapControls() {
  const { current: map } = useMap();
  const setViewState = useMapStore((s) => s.setViewState);

  const zoomIn = () => map?.zoomIn();
  const zoomOut = () => map?.zoomOut();

  const resetNorth = () => {
    map?.easeTo({ bearing: 0, pitch: 0, duration: 500 });
  };

  const resetView = () => {
    map?.flyTo({
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      duration: 1500,
    });
    setViewState(INITIAL_VIEW);
  };

  return (
    <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-1 rounded-xl border border-border/50 bg-background/80 p-1 shadow-lg backdrop-blur-md">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} aria-label="Zoom in">
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} aria-label="Zoom out">
        <Minus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetNorth} aria-label="Reset north">
        <Compass className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetView} aria-label="Reset view">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
