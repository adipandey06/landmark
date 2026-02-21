import { useQuery } from "@tanstack/react-query";
import type { AuditFilter } from "@/lib/types";
import { fetchAuditEvents } from "@/lib/api/audit";

export function useAuditEvents(filter?: AuditFilter) {
  return useQuery({
    queryKey: ["audit-events", filter],
    queryFn: () => fetchAuditEvents(filter),
  });
}
