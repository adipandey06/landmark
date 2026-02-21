import type { AuditEvent, AuditFilter } from "@/lib/types";
import { MOCK_AUDIT_EVENTS } from "@/lib/mock-data/audit-events";
import { mockFetch } from "./client";

export async function fetchAuditEvents(
  filter?: AuditFilter
): Promise<AuditEvent[]> {
  let events = [...MOCK_AUDIT_EVENTS];

  if (filter?.type) {
    events = events.filter((e) => e.type === filter.type);
  }
  if (filter?.sensorId) {
    events = events.filter((e) => e.sensorId === filter.sensorId);
  }
  if (filter?.dateFrom) {
    const from = new Date(filter.dateFrom).getTime();
    events = events.filter((e) => new Date(e.timestamp).getTime() >= from);
  }
  if (filter?.dateTo) {
    const to = new Date(filter.dateTo).getTime();
    events = events.filter((e) => new Date(e.timestamp).getTime() <= to);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (e.sensorName?.toLowerCase().includes(q) ?? false) ||
        e.hash.includes(q)
    );
  }

  return mockFetch(events);
}
