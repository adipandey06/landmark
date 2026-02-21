"use client";

import { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  ZoomControl,
  Popup,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSensors } from "@/hooks/use-sensors";
import { STATUS_COLORS } from "@/lib/utils/geo";
import type { SensorFilter, Sensor, SatelliteLayer } from "@/lib/types";
import { MapFilterBar } from "./map-filter-bar";
import { SensorDetailPanel } from "./sensor-detail-panel";
import { SatelliteLayerControl } from "./satellite-layer-control";
import { ErrorState } from "@/components/shared/error-state";
import { MapLoadingSkeleton } from "@/components/skeletons";
import { SATELLITE_LAYERS } from "@/lib/mock-data/satellite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let bg = "#60a5fa";
  let size = 36;
  if (count >= 30) {
    bg = "#1d4ed8";
    size = 48;
  } else if (count >= 10) {
    bg = "#3b82f6";
    size = 40;
  }
  return L.divIcon({
    html: `<div style="background:${bg};color:#fff;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${count}</div>`,
    className: "",
    iconSize: L.point(size, size),
  });
}

function SatelliteTileLayers({
  layers,
}: {
  layers: SatelliteLayer[];
}) {
  const visibleLayers = layers.filter((l) => l.visible);
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {visibleLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.sourceUrl.replace("{Date}", today)}
          opacity={layer.opacity}
          attribution="NASA GIBS"
        />
      ))}
    </>
  );
}

export function SensorMap() {
  const [filter, setFilter] = useState<SensorFilter>({});
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [satelliteLayers, setSatelliteLayers] = useState<SatelliteLayer[]>(
    SATELLITE_LAYERS.map((l) => ({ ...l }))
  );
  const { data: sensors, isLoading, isError, refetch } = useSensors(filter);

  const handleToggleLayer = useCallback((id: string) => {
    setSatelliteLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const handleOpacityChange = useCallback((id: string, opacity: number) => {
    setSatelliteLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
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
      <MapContainer
        center={[10, 40]}
        zoom={2.5}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#f8fafc" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SatelliteTileLayers layers={satelliteLayers} />
        <ZoomControl position="bottomright" />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          iconCreateFunction={createClusterIcon}
        >
          {sensors?.map((sensor) => (
            <CircleMarker
              key={sensor.id}
              center={[sensor.coordinates.lat, sensor.coordinates.lng]}
              radius={7}
              pathOptions={{
                fillColor: STATUS_COLORS[sensor.status] ?? "#6b7280",
                color: "#ffffff",
                weight: 2,
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => setSelectedSensor(sensor),
              }}
            >
              <Popup>
                <span className="font-mono text-xs">{sensor.name}</span>
              </Popup>
            </CircleMarker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      <MapFilterBar filter={filter} onFilterChange={setFilter} />
      <SatelliteLayerControl
        layers={satelliteLayers}
        onToggle={handleToggleLayer}
        onOpacityChange={handleOpacityChange}
      />
      {selectedSensor && (
        <SensorDetailPanel
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}
