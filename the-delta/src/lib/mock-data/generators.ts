import type { Region } from "@/lib/types";

const BASE58_CHARS =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const HEX_CHARS = "0123456789abcdef";

function randomChars(chars: string, length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function fakeTxSignature(): string {
  return randomChars(BASE58_CHARS, 88);
}

export function fakeHash(): string {
  return randomChars(HEX_CHARS, 64);
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface BoundingBox {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

export const REGION_BOUNDS: Record<Region, BoundingBox> = {
  "sub-saharan-africa": { latMin: -4, latMax: 12, lngMin: -3, lngMax: 42 },
  "south-asia": { latMin: 8, latMax: 30, lngMin: 68, lngMax: 92 },
  "southeast-asia": { latMin: 5, latMax: 21, lngMin: 98, lngMax: 122 },
};

export const COUNTRY_COORDS: Record<
  string,
  { lat: number; lng: number; region: Region }
> = {
  Kenya: { lat: -1.29, lng: 36.82, region: "sub-saharan-africa" },
  Nigeria: { lat: 9.06, lng: 7.49, region: "sub-saharan-africa" },
  Ethiopia: { lat: 9.02, lng: 38.75, region: "sub-saharan-africa" },
  Ghana: { lat: 5.6, lng: -0.19, region: "sub-saharan-africa" },
  Uganda: { lat: 0.35, lng: 32.58, region: "sub-saharan-africa" },
  India: { lat: 20.59, lng: 78.96, region: "south-asia" },
  Bangladesh: { lat: 23.81, lng: 90.41, region: "south-asia" },
  Nepal: { lat: 28.39, lng: 84.12, region: "south-asia" },
  Vietnam: { lat: 14.06, lng: 108.28, region: "southeast-asia" },
  Cambodia: { lat: 12.57, lng: 104.99, region: "southeast-asia" },
  Philippines: { lat: 12.88, lng: 121.77, region: "southeast-asia" },
};

const COUNTRY_BOUNDS: Record<string, BoundingBox> = {
  Kenya: { latMin: -4.8, latMax: 5.2, lngMin: 33.6, lngMax: 41.9 },
  Nigeria: { latMin: 4.0, latMax: 13.9, lngMin: 2.6, lngMax: 14.7 },
  Ethiopia: { latMin: 3.4, latMax: 14.9, lngMin: 32.9, lngMax: 47.9 },
  Ghana: { latMin: 4.6, latMax: 11.2, lngMin: -3.4, lngMax: 1.4 },
  Uganda: { latMin: -1.7, latMax: 4.3, lngMin: 29.4, lngMax: 35.0 },
  India: { latMin: 8.1, latMax: 34.5, lngMin: 68.1, lngMax: 97.5 },
  Bangladesh: { latMin: 20.7, latMax: 26.7, lngMin: 88.0, lngMax: 92.8 },
  Nepal: { latMin: 26.3, latMax: 30.5, lngMin: 80.0, lngMax: 88.3 },
  Vietnam: { latMin: 8.2, latMax: 23.4, lngMin: 102.1, lngMax: 109.5 },
  Cambodia: { latMin: 10.3, latMax: 14.7, lngMin: 102.3, lngMax: 107.7 },
  Philippines: { latMin: 5.0, latMax: 19.0, lngMin: 117.0, lngMax: 126.6 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomCoord(country: string): { lat: number; lng: number } {
  const base = COUNTRY_COORDS[country];
  if (!base) return { lat: 0, lng: 0 };

  const bounds = COUNTRY_BOUNDS[country];
  if (!bounds) {
    return {
      lat: base.lat + randomInRange(-0.6, 0.6),
      lng: base.lng + randomInRange(-0.6, 0.6),
    };
  }

  // Gaussian-like jitter around city/country centroid, then clamp to country bbox.
  const latJitter = (randomInRange(-1, 1) + randomInRange(-1, 1)) * 0.55;
  const lngJitter = (randomInRange(-1, 1) + randomInRange(-1, 1)) * 0.55;

  return {
    lat: clamp(base.lat + latJitter, bounds.latMin, bounds.latMax),
    lng: clamp(base.lng + lngJitter, bounds.lngMin, bounds.lngMax),
  };
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export function minutesAgo(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}
