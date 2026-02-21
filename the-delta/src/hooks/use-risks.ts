import { useQuery } from "@tanstack/react-query";
import type { RiskFilter } from "@/lib/types";
import { fetchRisks, fetchRisk } from "@/lib/api/risks";

export function useRisks(filter?: RiskFilter) {
  return useQuery({
    queryKey: ["risks", filter],
    queryFn: () => fetchRisks(filter),
  });
}

export function useRisk(id: string) {
  return useQuery({
    queryKey: ["risk", id],
    queryFn: () => fetchRisk(id),
    enabled: !!id,
  });
}
