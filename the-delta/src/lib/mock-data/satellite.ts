import type {
  SatelliteLayer,
  DataCoverageStats,
  FusionScore,
  DailyCoverage,
} from "@/lib/types";

export const SATELLITE_LAYERS: SatelliteLayer[] = [
  {
    id: "ndvi",
    name: "NDVI Vegetation",
    description: "Normalized Difference Vegetation Index from MODIS Terra",
    sourceUrl:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{Date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
    opacity: 0.6,
    visible: false,
  },
  {
    id: "smap-soil",
    name: "SMAP Soil Moisture",
    description: "NASA SMAP L3 radiometer soil moisture estimates",
    sourceUrl:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_L3_Passive_Day_Soil_Moisture/default/{Date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    opacity: 0.5,
    visible: false,
  },
  {
    id: "gpm-precip",
    name: "GPM Precipitation",
    description: "Global Precipitation Measurement (GPM) IMERG data",
    sourceUrl:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_3IMERGDL_Precipitation/default/{Date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    opacity: 0.5,
    visible: false,
  },
];

export const MOCK_COVERAGE_STATS: DataCoverageStats[] = [
  {
    region: "Sub-Saharan Africa",
    satelliteCoveragePct: 72,
    sensorCoveragePct: 18,
    fusedCoveragePct: 85,
    gapDays: 25,
    sensorFilledDays: 12,
  },
  {
    region: "South Asia",
    satelliteCoveragePct: 68,
    sensorCoveragePct: 24,
    fusedCoveragePct: 88,
    gapDays: 29,
    sensorFilledDays: 18,
  },
  {
    region: "Southeast Asia",
    satelliteCoveragePct: 61,
    sensorCoveragePct: 21,
    fusedCoveragePct: 79,
    gapDays: 35,
    sensorFilledDays: 14,
  },
];

export const MOCK_FUSION_SCORES: FusionScore[] = [
  {
    label: "Soil Moisture",
    satelliteOnlyAccuracy: 71,
    fusedAccuracy: 94,
    improvement: 23,
    metric: "RMSE %",
  },
  {
    label: "NDVI Correlation",
    satelliteOnlyAccuracy: 78,
    fusedAccuracy: 96,
    improvement: 18,
    metric: "R² score",
  },
  {
    label: "Precipitation Accuracy",
    satelliteOnlyAccuracy: 65,
    fusedAccuracy: 89,
    improvement: 24,
    metric: "MAE mm/day",
  },
  {
    label: "Temperature Calibration",
    satelliteOnlyAccuracy: 91,
    fusedAccuracy: 94,
    improvement: 3,
    metric: "Bias °C",
  },
];

function generateDailyCoverage(): DailyCoverage[] {
  const days: DailyCoverage[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const seed = (i * 17 + 31) % 100;
    const cloudCover = ((i * 13 + 7) % 60) + 10;
    days.push({
      date: d.toISOString().split("T")[0],
      hasSatellite: cloudCover < 50,
      hasSensor: seed < 75,
      cloudCoverPct: cloudCover,
    });
  }
  return days;
}

export const MOCK_DAILY_COVERAGE: DailyCoverage[] = generateDailyCoverage();

function generateSoilSatelliteTimeseries(): Array<{
  date: string;
  satelliteEstimate: number;
  sensorGroundTruth: number;
}> {
  const data: Array<{
    date: string;
    satelliteEstimate: number;
    sensorGroundTruth: number;
  }> = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 35 + Math.sin(i * 0.3) * 10;
    data.push({
      date: d.toISOString().split("T")[0],
      satelliteEstimate: Math.round((base + (((i * 7) % 11) - 5)) * 10) / 10,
      sensorGroundTruth: Math.round((base + (((i * 3) % 5) - 2)) * 10) / 10,
    });
  }
  return data;
}

export const MOCK_SOIL_SATELLITE_TIMESERIES = generateSoilSatelliteTimeseries();
