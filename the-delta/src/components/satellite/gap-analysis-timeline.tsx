"use client";

import { MOCK_DAILY_COVERAGE } from "@/lib/mock-data/satellite";

function getCellColor(day: { hasSatellite: boolean; hasSensor: boolean }) {
  if (day.hasSatellite && day.hasSensor) return "bg-green-500";
  if (day.hasSatellite && !day.hasSensor) return "bg-blue-500";
  if (!day.hasSatellite && day.hasSensor) return "bg-orange-500";
  return "bg-zinc-300 dark:bg-zinc-700";
}

function getCellTitle(day: {
  date: string;
  hasSatellite: boolean;
  hasSensor: boolean;
  cloudCoverPct: number;
}) {
  const sources: string[] = [];
  if (day.hasSatellite) sources.push("Satellite");
  if (day.hasSensor) sources.push("Sensor");
  if (sources.length === 0) sources.push("No data");
  return `${day.date} — ${sources.join(" + ")} (Cloud: ${day.cloudCoverPct}%)`;
}

export function GapAnalysisTimeline() {
  const data = MOCK_DAILY_COVERAGE;

  const bothCount = data.filter((d) => d.hasSatellite && d.hasSensor).length;
  const satOnlyCount = data.filter(
    (d) => d.hasSatellite && !d.hasSensor
  ).length;
  const sensorFillCount = data.filter(
    (d) => !d.hasSatellite && d.hasSensor
  ).length;
  const noDataCount = data.filter(
    (d) => !d.hasSatellite && !d.hasSensor
  ).length;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        90-Day Data Coverage Timeline
      </h2>

      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div
          className="mx-auto grid gap-[3px]"
          style={{
            gridTemplateColumns: "repeat(7, 1fr)",
            maxWidth: "420px",
          }}
        >
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center font-mono text-[9px] text-muted-foreground/60"
            >
              {day}
            </div>
          ))}

          {/* Pad start to align with day-of-week */}
          {Array.from({
            length: new Date(data[0]?.date ?? Date.now()).getDay(),
          }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {data.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-sm ${getCellColor(
                day
              )} opacity-90 transition-opacity hover:opacity-100`}
              title={getCellTitle(day)}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px]">
          <LegendItem color="bg-green-500" label="Both" count={bothCount} />
          <LegendItem
            color="bg-blue-500"
            label="Satellite only"
            count={satOnlyCount}
          />
          <LegendItem
            color="bg-orange-500"
            label="Sensor fills gap"
            count={sensorFillCount}
          />
          <LegendItem
            color="bg-zinc-300 dark:bg-zinc-700"
            label="No data"
            count={noDataCount}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Days" value={data.length.toString()} />
        <StatCard
          label="Full Coverage"
          value={`${Math.round((bothCount / data.length) * 100)}%`}
        />
        <StatCard
          label="Sensor Gap-Fill"
          value={`${sensorFillCount} days`}
          highlight
        />
        <StatCard
          label="Data Blackout"
          value={`${noDataCount} days`}
          warn={noDataCount > 10}
        />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
      <span className="font-mono text-muted-foreground">
        {label} ({count})
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
      <p
        className={`font-mono text-xl font-bold ${
          highlight
            ? "text-orange-500"
            : warn
              ? "text-red-500"
              : ""
        }`}
      >
        {value}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
