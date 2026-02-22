import { useQuery } from "@tanstack/react-query";
import type { DashboardInsights } from "@/lib/types";

async function fetchDashboardInsights(): Promise<DashboardInsights> {
  const res = await fetch("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard insights");
  }

  return res.json();
}

export function useDashboardInsights() {
  return useQuery({
    queryKey: ["dashboard-insights"],
    queryFn: fetchDashboardInsights,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}
