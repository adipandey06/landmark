export type AuditEventType =
  | "sensor-reading"
  | "risk-assessment"
  | "calibration"
  | "maintenance"
  | "alert"
  | "merkle-root"
  | "verification";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  sensorId: string | null;
  sensorName: string | null;
  description: string;
  timestamp: string;
  hash: string;
  txSignature: string | null;
  metadata: Record<string, string>;
}

export interface AuditFilter {
  type?: AuditEventType;
  sensorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
