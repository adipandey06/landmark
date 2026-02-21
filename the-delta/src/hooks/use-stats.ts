import { useQuery } from "@tanstack/react-query";
import { fetchGlobalStats, fetchRegionStats } from "@/lib/api/stats";

export function useGlobalStats() {
  return useQuery({
    queryKey: ["global-stats"],
    queryFn: fetchGlobalStats,
  });
}

export function useRegionStats() {
  return useQuery({
    queryKey: ["region-stats"],
    queryFn: fetchRegionStats,
  });
}
