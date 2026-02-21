import type { Region, RiskLevel } from "@/lib/types";

export interface RegionStats {
  iso: string;
  name: string;
  region: Region;
  riskLevel: number; // 0–5 continuous score
  riskCategory: RiskLevel;
  humidity: number; // % (0–100)
  ph: number; // 0–14
  temperature: number; // °C
  alertDensity: number; // alerts per 1000 km²
  trend: "improving" | "stable" | "worsening";
}

// Deterministic seeded PRNG so mock data is stable across renders
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function riskCategory(score: number): RiskLevel {
  if (score < 1.5) return "low";
  if (score < 3) return "medium";
  if (score < 4) return "high";
  return "critical";
}

const TRENDS: RegionStats["trend"][] = ["improving", "stable", "worsening"];

interface CountryDef {
  iso: string;
  name: string;
  region: Region;
}

const COUNTRIES: CountryDef[] = [
  // ── West / Sub-Saharan Africa ──────────────────────────
  { iso: "NG", name: "Nigeria", region: "sub-saharan-africa" },
  { iso: "GH", name: "Ghana", region: "sub-saharan-africa" },
  { iso: "KE", name: "Kenya", region: "sub-saharan-africa" },
  { iso: "ET", name: "Ethiopia", region: "sub-saharan-africa" },
  { iso: "UG", name: "Uganda", region: "sub-saharan-africa" },
  { iso: "SN", name: "Senegal", region: "sub-saharan-africa" },
  { iso: "CI", name: "Ivory Coast", region: "sub-saharan-africa" },
  { iso: "TZ", name: "Tanzania", region: "sub-saharan-africa" },
  { iso: "ML", name: "Mali", region: "sub-saharan-africa" },
  { iso: "BF", name: "Burkina Faso", region: "sub-saharan-africa" },

  // ── South Asia ─────────────────────────────────────────
  { iso: "IN", name: "India", region: "south-asia" },
  { iso: "BD", name: "Bangladesh", region: "south-asia" },
  { iso: "NP", name: "Nepal", region: "south-asia" },
  { iso: "PK", name: "Pakistan", region: "south-asia" },
  { iso: "LK", name: "Sri Lanka", region: "south-asia" },

  // ── Southeast Asia ─────────────────────────────────────
  { iso: "VN", name: "Vietnam", region: "southeast-asia" },
  { iso: "KH", name: "Cambodia", region: "southeast-asia" },
  { iso: "PH", name: "Philippines", region: "southeast-asia" },
  { iso: "MM", name: "Myanmar", region: "southeast-asia" },
  { iso: "LA", name: "Laos", region: "southeast-asia" },
  { iso: "TH", name: "Thailand", region: "southeast-asia" },
];

function generateRegionStats(): Map<string, RegionStats> {
  const rand = seededRandom(2024);
  const map = new Map<string, RegionStats>();

  for (const c of COUNTRIES) {
    const risk = Math.round(rand() * 50) / 10; // 0.0–5.0
    map.set(c.iso, {
      iso: c.iso,
      name: c.name,
      region: c.region,
      riskLevel: risk,
      riskCategory: riskCategory(risk),
      humidity: Math.round(40 + rand() * 50), // 40–90 %
      ph: Math.round((5.5 + rand() * 3) * 10) / 10, // 5.5–8.5
      temperature: Math.round((20 + rand() * 18) * 10) / 10, // 20–38 °C
      alertDensity: Math.round(rand() * 120) / 10, // 0–12 alerts/1k km²
      trend: TRENDS[Math.floor(rand() * TRENDS.length)],
    });
  }

  return map;
}

export const REGION_STATS: Map<string, RegionStats> = generateRegionStats();

/** Convenience array export for iteration */
export const REGION_STATS_LIST: RegionStats[] = [...REGION_STATS.values()];

/** Lookup by ISO code */
export function getRegionStat(iso: string): RegionStats | undefined {
  return REGION_STATS.get(iso);
}
