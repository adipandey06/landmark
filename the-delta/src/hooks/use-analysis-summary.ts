import { useQuery } from "@tanstack/react-query";
import type { AiSummary } from "@/lib/types";

async function fetchAnalysisSummary(
  sensorId: string,
  metricKey: string
): Promise<AiSummary> {
  const res = await fetch("/api/analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sensorId, metricKey }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch analysis summary");
  }

  return res.json();
}

export function useAnalysisSummary(sensorId: string, metricKey = "temperature") {
  return useQuery({
    queryKey: ["analysis-summary", sensorId, metricKey],
    queryFn: () => fetchAnalysisSummary(sensorId, metricKey),
    enabled: !!sensorId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
