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
  "merkle-root",
  "verification",
];

const DESCRIPTIONS: Record<AuditEventType, string[]> = {
  "sensor-reading": [
    "LP Board reading anchored: Temp 22.4°C, Hum 45.2%, pH 6.8",
    "LP Board reading anchored: Temp 24.1°C, Hum 50.1%, pH 7.1",
    "LP Board reading anchored: Temp 25.8°C, Hum 55.4%, pH 7.0",
    "LP Board reading anchored: Temp 21.9°C, Hum 42.8%, pH 6.5",
    "LP Board reading anchored: Temp 23.5°C, Hum 48.7%, pH 6.9",
    "LP Board reading anchored: Temp 26.2°C, Hum 60.3%, pH 7.2",
  ],
  "merkle-root": [
    "Hourly Merkle root published to Solana",
    "Batch of 128 readings anchored on-chain",
    "Daily aggregation root submitted for verification",
    "Cross-region Merkle tree root finalized",
  ],
  verification: [
    "On-chain verification confirmed for LP Board batch",
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
