import type { Sensor, SensorFilter, SensorReading } from "@/lib/types";
import { MOCK_SENSORS } from "@/lib/mock-data/sensors";
import { mockFetch } from "./client";
import { randomInRange } from "@/lib/mock-data/generators";

export async function fetchSensors(filter?: SensorFilter): Promise<Sensor[]> {
  let sensors = MOCK_SENSORS;

  if (filter?.region) {
    sensors = sensors.filter((s) => s.region === filter.region);
  }
  if (filter?.status) {
    sensors = sensors.filter((s) => s.status === filter.status);
  }
  if (filter?.type) {
    sensors = sensors.filter((s) => s.type === filter.type);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    sensors = sensors.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }

  return mockFetch(sensors);
}

export async function fetchSensor(id: string): Promise<Sensor | null> {
  const sensor = MOCK_SENSORS.find((s) => s.id === id) ?? null;
  return mockFetch(sensor);
}

export async function fetchSensorReadings(
  sensorId: string,
  hours: number = 24
): Promise<SensorReading[]> {
  const readings: SensorReading[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 48;

  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(now - interval * (48 - i)).toISOString();
    readings.push({
      timestamp,
      value: Math.round(randomInRange(5, 12) * 10) / 10,
      metric: "dissolvedOxygen",
    });
  }

  return mockFetch(readings);
}
