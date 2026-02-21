"use client";

import dynamic from "next/dynamic";
import { MapLoadingSkeleton } from "@/components/skeletons";
import { MapErrorBoundary } from "@/components/map/map-error-boundary";
import { InfoBanner } from "@/components/layout/info-banner";

const SensorMap = dynamic(
  () => import("@/components/map/sensor-map").then((m) => m.SensorMap),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
);

export default function MapPage() {
  return (
    <>
      <div className="absolute left-1/2 top-4 z-[500] w-full max-w-3xl -translate-x-1/2 px-4 pointer-events-none">
        <div className="pointer-events-auto shadow-lg rounded-xl">
        </div>
      </div>
      <MapErrorBoundary>
        <SensorMap />
      </MapErrorBoundary>
    </>
  );
}
