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

export function randomCoord(country: string): { lat: number; lng: number } {
  const base = COUNTRY_COORDS[country];
  if (!base) return { lat: 0, lng: 0 };
  return {
    lat: base.lat + randomInRange(-2, 2),
    lng: base.lng + randomInRange(-2, 2),
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
