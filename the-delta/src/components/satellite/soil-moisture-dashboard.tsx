"use client";

import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { MOCK_SOIL_SATELLITE_TIMESERIES } from "@/lib/mock-data/satellite";

export function SoilMoistureDashboard() {
  const latest = MOCK_SOIL_SATELLITE_TIMESERIES[MOCK_SOIL_SATELLITE_TIMESERIES.length - 1];

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Soil Moisture: Satellite vs Ground Truth
      </h2>

      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={100}>
            <ComposedChart data={MOCK_SOIL_SATELLITE_TIMESERIES}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                tickFormatter={(d) => String(d).slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                tickFormatter={(v) => `${v}%`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  fontFamily: "var(--font-geist-mono)",
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === "satelliteEstimate"
                    ? "Satellite Estimate"
                    : "Sensor Ground Truth",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="satelliteEstimate"
                fill="#3b82f6"
                fillOpacity={0.05}
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="satelliteEstimate"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                name="satelliteEstimate"
              />
              <Line
                type="monotone"
                dataKey="sensorGroundTruth"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="sensorGroundTruth"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-blue-500" />
            <span className="font-mono text-muted-foreground">
              Satellite Estimate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-6 bg-green-500" />
            <span className="font-mono text-muted-foreground">
              Sensor Ground Truth
            </span>
          </div>
        </div>
      </div>

      {latest && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ReadingCard
            label="Satellite Est."
            value={`${latest.satelliteEstimate}%`}
            color="text-blue-500"
          />
          <ReadingCard
            label="Ground Truth"
            value={`${latest.sensorGroundTruth}%`}
            color="text-green-600"
          />
          <ReadingCard
            label="Divergence"
            value={`${Math.abs(
              Math.round(
                (latest.satelliteEstimate - latest.sensorGroundTruth) * 10
              ) / 10
            )}%`}
            color="text-orange-500"
          />
          <ReadingCard
            label="Correction"
            value="Applied"
            color="text-primary"
          />
        </div>
      )}
    </div>
  );
}

function ReadingCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-mono text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
