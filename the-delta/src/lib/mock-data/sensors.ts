import type { Sensor, SensorType, SensorStatus, SensorMetrics } from "@/lib/types";
import {
  fakeTxSignature,
  fakeHash,
  randomCoord,
  randomInRange,
  randomInt,
  pickRandom,
  minutesAgo,
  daysAgo,
  COUNTRY_COORDS,
} from "./generators";

const WATER_SENSOR_TYPES: SensorType[] = [
  "water-quality",
  "flow-rate",
  "pressure",
  "level",
  "turbidity",
];

const SOIL_SENSOR_TYPES: SensorType[] = [
  "soil-moisture",
  "soil-temperature",
  "soil-ph",
  "conductivity",
];

const SENSOR_TYPES: SensorType[] = [...WATER_SENSOR_TYPES, ...SOIL_SENSOR_TYPES];

const SOIL_SUFFIXES = [
  "Soil Station",
  "Agricultural Monitor",
  "Field Sensor",
  "Crop Monitor",
  "Agri Node",
];

const WATER_SUFFIXES = [
  "WTP",
  "Pump Station",
  "Reservoir",
  "Treatment Plant",
  "Distribution Node",
];

function generateMetrics(): SensorMetrics {
  return {
    ph: Math.round(randomInRange(6.0, 8.5) * 10) / 10,
    turbidity: Math.round(randomInRange(0.5, 15) * 10) / 10,
    dissolvedOxygen: Math.round(randomInRange(4, 12) * 10) / 10,
    temperature: Math.round(randomInRange(18, 35) * 10) / 10,
    flowRate: Math.round(randomInRange(10, 500) * 10) / 10,
    pressure: Math.round(randomInRange(1, 8) * 100) / 100,
  };
}

interface SensorDef {
  country: string;
  city: string;
}

const SSA_SENSORS: SensorDef[] = [
  { country: "Kenya", city: "Nairobi" },
  { country: "Kenya", city: "Mombasa" },
  { country: "Kenya", city: "Kisumu" },
  { country: "Kenya", city: "Nakuru" },
  { country: "Kenya", city: "Eldoret" },
  { country: "Nigeria", city: "Lagos" },
  { country: "Nigeria", city: "Abuja" },
  { country: "Nigeria", city: "Kano" },
  { country: "Nigeria", city: "Ibadan" },
  { country: "Nigeria", city: "Port Harcourt" },
  { country: "Ethiopia", city: "Addis Ababa" },
  { country: "Ethiopia", city: "Dire Dawa" },
  { country: "Ethiopia", city: "Mekelle" },
  { country: "Ethiopia", city: "Bahir Dar" },
  { country: "Ethiopia", city: "Hawassa" },
  { country: "Ghana", city: "Accra" },
  { country: "Ghana", city: "Kumasi" },
  { country: "Ghana", city: "Tamale" },
  { country: "Ghana", city: "Takoradi" },
  { country: "Uganda", city: "Kampala" },
  { country: "Uganda", city: "Entebbe" },
  { country: "Uganda", city: "Gulu" },
  { country: "Uganda", city: "Jinja" },
  { country: "Uganda", city: "Mbarara" },
  { country: "Kenya", city: "Thika" },
];

const SA_SENSORS: SensorDef[] = [
  { country: "India", city: "Mumbai" },
  { country: "India", city: "Delhi" },
  { country: "India", city: "Chennai" },
  { country: "India", city: "Kolkata" },
  { country: "India", city: "Bangalore" },
  { country: "India", city: "Hyderabad" },
  { country: "India", city: "Pune" },
  { country: "India", city: "Jaipur" },
  { country: "India", city: "Lucknow" },
  { country: "India", city: "Varanasi" },
  { country: "Bangladesh", city: "Dhaka" },
  { country: "Bangladesh", city: "Chittagong" },
  { country: "Bangladesh", city: "Khulna" },
  { country: "Bangladesh", city: "Sylhet" },
  { country: "Bangladesh", city: "Rajshahi" },
  { country: "Nepal", city: "Kathmandu" },
  { country: "Nepal", city: "Pokhara" },
  { country: "Nepal", city: "Biratnagar" },
  { country: "Nepal", city: "Lalitpur" },
  { country: "India", city: "Ahmedabad" },
];

const SEA_SENSORS: SensorDef[] = [
  { country: "Vietnam", city: "Ho Chi Minh City" },
  { country: "Vietnam", city: "Hanoi" },
  { country: "Vietnam", city: "Da Nang" },
  { country: "Vietnam", city: "Can Tho" },
  { country: "Vietnam", city: "Hue" },
  { country: "Cambodia", city: "Phnom Penh" },
  { country: "Cambodia", city: "Siem Reap" },
  { country: "Cambodia", city: "Battambang" },
  { country: "Cambodia", city: "Sihanoukville" },
  { country: "Philippines", city: "Manila" },
  { country: "Philippines", city: "Cebu" },
  { country: "Philippines", city: "Davao" },
  { country: "Philippines", city: "Quezon City" },
  { country: "Philippines", city: "Iloilo" },
  { country: "Vietnam", city: "Hai Phong" },
];

function assignStatus(index: number): SensorStatus {
  const r = (index * 7 + 13) % 100;
  if (r < 70) return "online";
  if (r < 85) return "warning";
  if (r < 95) return "offline";
  return "critical";
}

function generateSoilMetrics(): Partial<SensorMetrics> {
  return {
    soilMoisture: Math.round(randomInRange(10, 60) * 10) / 10,
    soilTemperature: Math.round(randomInRange(15, 40) * 10) / 10,
    soilPh: Math.round(randomInRange(4.5, 8.5) * 10) / 10,
    electricalConductivity: Math.round(randomInRange(0.2, 4.0) * 100) / 100,
  };
}

function createSensor(def: SensorDef, index: number): Sensor {
  const coords = randomCoord(def.country);
  const region = COUNTRY_COORDS[def.country].region;
  const status = assignStatus(index);
  const isSoil = index % 3 === 0; // ~33% soil sensors
  const type = isSoil
    ? pickRandom(SOIL_SENSOR_TYPES)
    : pickRandom(WATER_SENSOR_TYPES);
  const suffix = isSoil
    ? pickRandom(SOIL_SUFFIXES)
    : pickRandom(WATER_SUFFIXES);

  const metrics: SensorMetrics = {
    ...generateMetrics(),
    ...(isSoil ? generateSoilMetrics() : {}),
  };

  return {
    id: `SEN-${String(index + 1).padStart(4, "0")}`,
    name: `${def.city} ${suffix}`,
    type,
    status,
    region,
    country: def.country,
    coordinates: coords,
    installedAt: daysAgo(randomInt(90, 730)),
    lastReading: minutesAgo(status === "offline" ? randomInt(120, 1440) : randomInt(1, 30)),
    metrics,
    txSignature: fakeTxSignature(),
    dataHash: fakeHash(),
  };
}

const ALL_DEFS = [...SSA_SENSORS, ...SA_SENSORS, ...SEA_SENSORS];

export const MOCK_SENSORS: Sensor[] = ALL_DEFS.map((def, i) =>
  createSensor(def, i)
);
