import type { Expression } from "mapbox-gl";
import { REGION_STATS } from "@/lib/mock-data/regions";

export interface Palette {
  name: string;
  colors: string[];
  labels: string[];
  domain: number[];
}

export const PALETTES = {
  risk: {
    name: "Risk Score",
    colors: ["#2d6a4f", "#52b788", "#f9c74f", "#f3722c", "#e63946"],
    labels: ["Very Low", "Low", "Moderate", "High", "Critical"],
    domain: [1, 2, 3, 4],
  },
  severity: {
    name: "Severity",
    colors: ["#219ebc", "#8ecae6", "#ffb703", "#fb8500", "#d62828"],
    labels: ["Minimal", "Minor", "Moderate", "Major", "Extreme"],
    domain: [1, 2, 3, 4],
  },
  quality: {
    name: "Quality Index",
    colors: ["#d62828", "#f77f00", "#fcbf49", "#a7c957", "#386641"],
    labels: ["Poor", "Fair", "Average", "Good", "Excellent"],
    domain: [1, 2, 3, 4],
  },
} as const;

export type PaletteKey = keyof typeof PALETTES;

export function generateStepExpression(
  property: string,
  paletteKey: PaletteKey
): Expression {
  const palette = PALETTES[paletteKey];
  const expr: unknown[] = ["step", ["get", property], palette.colors[0]];
  for (let i = 0; i < palette.domain.length; i++) {
    expr.push(palette.domain[i], palette.colors[i + 1]);
  }
  return expr as Expression;
}

export function getColorForValue(
  value: number,
  paletteKey: PaletteKey
): string {
  const palette = PALETTES[paletteKey];
  for (let i = palette.domain.length - 1; i >= 0; i--) {
    if (value >= palette.domain[i]) return palette.colors[i + 1];
  }
  return palette.colors[0];
}

/**
 * Generates a Mapbox `match` expression keyed on `iso_3166_1` that maps
 * every country in REGION_STATS to its palette-derived color.
 */
export function generateIsoMatchExpression(
  paletteKey: PaletteKey
): Expression {
  const expr: unknown[] = ["match", ["get", "iso_3166_1"]];
  for (const [iso, stats] of REGION_STATS) {
    expr.push(iso, getColorForValue(stats.riskLevel, paletteKey));
  }
  expr.push("rgba(255,255,255,0)"); // default: transparent
  return expr as Expression;
}
