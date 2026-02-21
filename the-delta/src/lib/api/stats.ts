import type { GlobalStats, RegionStats, Region } from "@/lib/types";
import { MOCK_SENSORS } from "@/lib/mock-data/sensors";
import { MOCK_RISKS } from "@/lib/mock-data/risks";
import { mockFetch } from "./client";

function generateSparkline(base: number, length: number = 12): number[] {
  const points: number[] = [];
  let current = base;
  for (let i = 0; i < length; i++) {
    current += (Math.random() - 0.5) * base * 0.1;
    points.push(Math.round(Math.max(0, current)));
  }
  return points;
}

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const activeAlerts = MOCK_RISKS.filter(
    (r) => r.level === "critical" || r.level === "high"
  ).length;
  const countries = new Set(MOCK_SENSORS.map((s) => s.country)).size;

  const stats: GlobalStats = {
    totalSensors: MOCK_SENSORS.length,
    activeAlerts,
    countriesMonitored: countries,
    populationServed: 12_400_000,
    sparklines: {
      sensors: generateSparkline(MOCK_SENSORS.length),
      alerts: generateSparkline(activeAlerts),
      countries: generateSparkline(countries),
      population: generateSparkline(12_400_000),
    },
  };

  return mockFetch(stats);
}

export async function fetchRegionStats(): Promise<RegionStats[]> {
  const regions: Region[] = [
    "sub-saharan-africa",
    "south-asia",
    "southeast-asia",
  ];

  const stats = regions.map((region) => {
    const sensors = MOCK_SENSORS.filter((s) => s.region === region);
    const risks = MOCK_RISKS.filter((r) => r.region === region);
    const online = sensors.filter((s) => s.status === "online").length;

    return {
      region,
      sensorCount: sensors.length,
      avgRiskScore: risks.length
        ? Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length)
        : 0,
      alertCount: risks.filter(
        (r) => r.level === "critical" || r.level === "high"
      ).length,
      onlinePercentage: sensors.length
        ? Math.round((online / sensors.length) * 100)
        : 0,
    };
  });

  return mockFetch(stats);
}
