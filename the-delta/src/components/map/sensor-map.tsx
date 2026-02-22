"use client";

import { useRef, useCallback, useEffect } from "react";
import Map, { type MapRef, type ViewStateChangeEvent, type MapMouseEvent } from "react-map-gl/mapbox";
import type mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSensors } from "@/hooks/use-sensors";
import { useMapStore, REGION_PRESETS } from "@/lib/stores/map-store";
import type { Sensor } from "@/lib/types";
import { MOCK_SENSORS } from "@/lib/mock-data/sensors";
import { SatelliteLayers } from "./layers/satellite-layers";
import { SensorLayer } from "./layers/sensor-layer";
import { MapFilterBar } from "./map-filter-bar";
import { MapControls } from "./map-controls";
import { SatelliteLayerControl } from "./satellite-layer-control";
import { SensorDetailPanel } from "./sensor-detail-panel";
import { MapLegend } from "./map-legend";
import { ErrorState } from "@/components/shared/error-state";
import { MapLoadingSkeleton } from "@/components/skeletons";
import { GridLayer } from "./layers/grid-layer";
import { CambodiaGridLayer } from "./layers/cambodia-grid-layer";
import { GridLayerControl } from "./grid-layer-control";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Remove the custom dark satellite style in favor of a clean standard style
const CLEAN_DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

function SensorMapInner() {
  const mapRef = useRef<MapRef>(null);
  const hoveredIdRef = useRef<string | null>(null);

  const viewState = useMapStore((s) => s.viewState);
  const setViewState = useMapStore((s) => s.setViewState);
  const activeRegion = useMapStore((s) => s.activeRegion);
  const selectedSensor = useMapStore((s) => s.selectedSensor);
  const setSelectedSensor = useMapStore((s) => s.setSelectedSensor);
  const filter = useMapStore((s) => s.filter);
  const setFilter = useMapStore((s) => s.setFilter);
  const satelliteLayers = useMapStore((s) => s.satelliteLayers);
  const toggleSatelliteLayer = useMapStore((s) => s.toggleSatelliteLayer);
  const setSatelliteOpacity = useMapStore((s) => s.setSatelliteOpacity);

  const { data: sensors, isLoading, isError, refetch } = useSensors(filter);

  // Region flyTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const preset = REGION_PRESETS[activeRegion];
    map.flyTo({
      center: [preset.longitude, preset.latitude],
      zoom: preset.zoom,
      pitch: preset.pitch ?? 0,
      bearing: preset.bearing ?? 0,
      duration: 1500,
    });
  }, [activeRegion]);

  // WebGL context loss handling
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const canvas = map.getCanvas();

    const onContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("WebGL context lost");
    };
    const onContextRestored = () => {
      console.info("WebGL context restored");
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, []);

  const onMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
    },
    [setViewState]
  );

  const onClick = useCallback(
    (evt: MapMouseEvent) => {
      const map = mapRef.current;
      if (!map) return;

      const hasLayer = (id: string) => Boolean(map.getLayer(id));

      const safeQuery = (layers: string[]) => {
        const existing = layers.filter((id) => hasLayer(id));
        if (existing.length === 0) return [];
        return map.queryRenderedFeatures(evt.point, { layers: existing });
      };

      // Guard: layers may not exist yet during initial load
      if (!hasLayer("sensor-clusters") || !hasLayer("sensor-circles")) return;

      // Check clusters first
      const clusterFeatures = safeQuery(["sensor-clusters"]);
      if (clusterFeatures.length > 0) {
        const feature = clusterFeatures[0];
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource("sensors");
        if (source && "getClusterExpansionZoom" in source) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (source as any).getClusterExpansionZoom(
            clusterId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err: any, zoom: any) => {
              if (err || zoom == null) return;
              const geom = feature.geometry;
              if (geom.type === "Point") {
                map.flyTo({
                  center: geom.coordinates as [number, number],
                  zoom,
                  duration: 500,
                });
              }
            }
          );
        }
        return;
      }

      // Check individual sensors
      const sensorFeatures = safeQuery(["sensor-circles"]);
      if (sensorFeatures.length > 0) {
        const props = sensorFeatures[0].properties;
        if (props?.id) {
          const sensor = MOCK_SENSORS.find((s) => s.id === props.id) ?? null;
          setSelectedSensor(sensor);
        }
        return;
      }

      setSelectedSensor(null);
    },
    [setSelectedSensor]
  );

  const onMouseMove = useCallback((evt: MapMouseEvent) => {
    const map = mapRef.current;
    if (!map || !map.getLayer("sensor-circles")) return;

    const hasLayer = (id: string) => Boolean(map.getLayer(id));

    const safeQuery = (layers: string[]) => {
      const existing = layers.filter((id) => hasLayer(id));
      if (existing.length === 0) return [];
      return map.queryRenderedFeatures(evt.point, { layers: existing });
    };

    // Check sensors first — they take priority
    const sensorFeatures = safeQuery(["sensor-circles"]);

    // Clear previous sensor hover
    if (hoveredIdRef.current !== null) {
      map.setFeatureState(
        { source: "sensors", id: hoveredIdRef.current },
        { hover: false }
      );
    }

    if (sensorFeatures.length > 0) {
      const id = sensorFeatures[0].properties?.id ?? null;
      if (id) {
        hoveredIdRef.current = id;
        map.setFeatureState(
          { source: "sensors", id },
          { hover: true }
        );
        map.getCanvas().style.cursor = "pointer";
      }
    } else {
      hoveredIdRef.current = null;
      map.getCanvas().style.cursor = "";
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (hoveredIdRef.current !== null) {
      map.setFeatureState(
        { source: "sensors", id: hoveredIdRef.current },
        { hover: false }
      );
      hoveredIdRef.current = null;
    }

    map.getCanvas().style.cursor = "";
  }, []);

  if (isLoading) return <MapLoadingSkeleton />;
  if (isError) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-8">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={CLEAN_DARK_STYLE}
        projection="mercator"
        maxPitch={0}
        reuseMaps
        style={{ width: "100%", height: "100%" }}
      >
        <SatelliteLayers />
        <GridLayer />
        <SensorLayer sensors={sensors ?? []} />
        <CambodiaGridLayer />
      </Map>
      <GridLayerControl />
      <MapFilterBar filter={filter} onFilterChange={setFilter} />
      <MapControls />
      <SatelliteLayerControl
        layers={satelliteLayers}
        onToggle={toggleSatelliteLayer}
        onOpacityChange={setSatelliteOpacity}
      />
      <MapLegend />
      {selectedSensor && (
        <SensorDetailPanel
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}

export function SensorMap() {
  return <SensorMapInner />;
}
