import type { AuditEvent, AuditEventType } from "@/lib/types";
import {
  fakeTxSignature,
  fakeHash,
  pickRandom,
  randomInt,
  minutesAgo,
} from "./generators";
import { MOCK_SENSORS } from "./sensors";

const EVENT_TYPES: AuditEventType[] = [
  "sensor-reading",
  "risk-assessment",
  "calibration",
  "maintenance",
  "alert",
  "merkle-root",
  "verification",
];

const DESCRIPTIONS: Record<AuditEventType, string[]> = {
  "sensor-reading": [
    "Sensor data batch recorded and hashed",
    "Water quality metrics captured from distribution network",
    "Flow rate measurements aggregated for verification",
    "Environmental sensor readings logged",
  ],
  "risk-assessment": [
    "AI risk model assessment completed and verified",
    "Contamination risk evaluation processed",
    "Infrastructure failure probability recalculated",
    "Regional risk profile updated by ML pipeline",
  ],
  calibration: [
    "Sensor calibration check completed — within tolerance",
    "pH sensor recalibrated — drift corrected",
    "Turbidity sensor baseline adjusted",
    "Flow meter calibration verified",
  ],
  maintenance: [
    "Scheduled maintenance completed on pump station",
    "Filter replacement logged at treatment plant",
    "Pipe section inspection documented",
    "Emergency repair on distribution valve",
  ],
  alert: [
    "Critical contamination alert triggered",
    "Pressure anomaly detected in transmission line",
    "Water level below minimum threshold",
    "Sensor offline for >2 hours — alert escalated",
  ],
  "merkle-root": [
    "Hourly Merkle root published to Solana",
    "Batch of 128 readings anchored on-chain",
    "Daily aggregation root submitted for verification",
    "Cross-region Merkle tree root finalized",
  ],
  verification: [
    "On-chain verification confirmed for sensor batch",
    "Blockchain proof validated against local hash",
    "Transaction confirmation received from Solana",
    "Audit proof cross-checked — integrity verified",
  ],
};

function generateEvents(): AuditEvent[] {
  const events: AuditEvent[] = [];
  const totalMinutes = 30 * 24 * 60; // 30 days in minutes

  for (let i = 0; i < 200; i++) {
    const type = pickRandom(EVENT_TYPES);
    const sensor =
      type === "merkle-root" || type === "verification"
        ? null
        : pickRandom(MOCK_SENSORS);
    const minsAgo = randomInt(1, totalMinutes);

    events.push({
      id: `AUD-${String(i + 1).padStart(5, "0")}`,
      type,
      sensorId: sensor?.id ?? null,
      sensorName: sensor?.name ?? null,
      description: pickRandom(DESCRIPTIONS[type]),
      timestamp: minutesAgo(minsAgo),
      hash: fakeHash(),
      txSignature:
        type === "merkle-root" || type === "verification" || Math.random() > 0.3
          ? fakeTxSignature()
          : null,
      metadata:
        type === "merkle-root"
          ? { leafCount: String(randomInt(64, 256)), batchId: fakeHash().slice(0, 16) }
          : {},
    });
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export const MOCK_AUDIT_EVENTS: AuditEvent[] = generateEvents();
