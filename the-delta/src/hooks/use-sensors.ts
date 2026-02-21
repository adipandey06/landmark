import { useQuery } from "@tanstack/react-query";
import type { SensorFilter } from "@/lib/types";
import { fetchSensors, fetchSensor, fetchSensorReadings } from "@/lib/api/sensors";

export function useSensors(filter?: SensorFilter) {
  return useQuery({
    queryKey: ["sensors", filter],
    queryFn: () => fetchSensors(filter),
  });
}

export function useSensor(id: string) {
  return useQuery({
    queryKey: ["sensor", id],
    queryFn: () => fetchSensor(id),
    enabled: !!id,
  });
}

export function useSensorReadings(sensorId: string, hours: number = 24) {
  return useQuery({
    queryKey: ["sensor-readings", sensorId, hours],
    queryFn: () => fetchSensorReadings(sensorId, hours),
    enabled: !!sensorId,
  });
}
