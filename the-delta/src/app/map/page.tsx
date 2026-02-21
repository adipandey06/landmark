"use client";

import dynamic from "next/dynamic";
import { MapLoadingSkeleton } from "@/components/skeletons";
import { MapErrorBoundary } from "@/components/map/map-error-boundary";

const SensorMap = dynamic(
  () => import("@/components/map/sensor-map").then((m) => m.SensorMap),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);

export default function MapPage() {
  return (
    <MapErrorBoundary>
      <SensorMap />
    </MapErrorBoundary>
  );
}
