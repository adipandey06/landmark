import type { FeatureCollection, Feature, Polygon } from "geojson";
import { REGION_BOUNDS, type BoundingBox } from "./generators";
import type { Region } from "@/lib/types";

interface RegionOverlayProperties {
  id: string;
  name: string;
  score: number;
  region: string;
}

// Deterministic pseudo-random using a seed
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createPolygon(
  lng: number,
  lat: number,
  sizeLng: number,
  sizeLat: number,
  rand: () => number
): [number, number][] {
  // Small jitter for natural look
  const jx = (rand() - 0.5) * 0.5;
  const jy = (rand() - 0.5) * 0.5;
  // Counter-clockwise winding
  const ring: [number, number][] = [
    [lng + jx, lat + jy],
    [lng + sizeLng + jx, lat + jy + (rand() - 0.5) * 0.3],
    [lng + sizeLng + jx + (rand() - 0.5) * 0.3, lat + sizeLat + jy],
    [lng + jx + (rand() - 0.5) * 0.3, lat + sizeLat + jy + (rand() - 0.5) * 0.3],
    [lng + jx, lat + jy], // close ring
  ];
  return ring;
}

const REGION_NAMES: Record<string, string[]> = {
  "sub-saharan-africa": [
    "Lagos Basin", "Nairobi Corridor", "Accra Delta", "Kampala Plateau",
    "Addis Highlands", "Mombasa Coast", "Abuja Plains", "Kumasi Valley",
    "Dar es Salaam", "Kigali Ridge",
  ],
  "south-asia": [
    "Delhi NCR", "Mumbai Coast", "Dhaka Floodplain", "Kathmandu Valley",
    "Chennai Basin", "Kolkata Delta", "Lahore Canal", "Bangalore Plateau",
  ],
  "southeast-asia": [
    "Mekong Delta", "Manila Bay", "Hanoi Lowlands", "Phnom Penh Basin",
    "Bangkok Plain", "Cebu Strait", "Ho Chi Minh Zone",
  ],
};

function generateRegionFeatures(
  regionKey: Region,
  bounds: BoundingBox,
  startIdx: number,
  rand: () => number
): Feature<Polygon, RegionOverlayProperties>[] {
  const names = REGION_NAMES[regionKey] ?? [];
  const features: Feature<Polygon, RegionOverlayProperties>[] = [];

  const lngSpan = bounds.lngMax - bounds.lngMin;
  const latSpan = bounds.latMax - bounds.latMin;

  for (let i = 0; i < names.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cellLng = lngSpan / 3;
    const cellLat = latSpan / 3;

    const lng = bounds.lngMin + col * cellLng + rand() * (cellLng * 0.3);
    const lat = bounds.latMin + row * cellLat + rand() * (cellLat * 0.3);
    const sizeLng = 3 + rand() * 2;
    const sizeLat = 3 + rand() * 2;

    const score = Math.round((rand() * 5) * 10) / 10;

    features.push({
      type: "Feature",
      id: `region-${startIdx + i}`,
      properties: {
        id: `region-${startIdx + i}`,
        name: names[i],
        score: Math.min(score, 5),
        region: regionKey,
      },
      geometry: {
        type: "Polygon",
        coordinates: [createPolygon(lng, lat, sizeLng, sizeLat, rand)],
      },
    });
  }

  return features;
}

const rand = seededRandom(42);

const allFeatures: Feature<Polygon, RegionOverlayProperties>[] = [
  ...generateRegionFeatures("sub-saharan-africa", REGION_BOUNDS["sub-saharan-africa"], 0, rand),
  ...generateRegionFeatures("south-asia", REGION_BOUNDS["south-asia"], 10, rand),
  ...generateRegionFeatures("southeast-asia", REGION_BOUNDS["southeast-asia"], 18, rand),
];

export const REGION_OVERLAYS: FeatureCollection<Polygon, RegionOverlayProperties> = {
  type: "FeatureCollection",
  features: allFeatures,
};
