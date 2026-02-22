"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MOCK_COVERAGE_STATS } from "@/lib/mock-data/satellite";

export function CoverageAnalysis() {
  const totalGapDays = MOCK_COVERAGE_STATS.reduce(
    (sum, r) => sum + r.gapDays,
    0
  );
  const totalFilled = MOCK_COVERAGE_STATS.reduce(
    (sum, r) => sum + r.sensorFilledDays,
    0
  );
  const improvementPct =
    totalGapDays > 0 ? Math.round((totalFilled / totalGapDays) * 100) : 0;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Regional Coverage Analysis
      </h2>

      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={100}>
            <BarChart
              data={MOCK_COVERAGE_STATS}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="region"
                tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  fontFamily: "var(--font-geist-mono)",
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 10,
                  fontFamily: "var(--font-geist-mono)",
                }}
              />
              <Bar
                dataKey="satelliteCoveragePct"
                name="Satellite"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="sensorCoveragePct"
                name="Sensor"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="fusedCoveragePct"
                name="Fused"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold">{totalGapDays}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Total Gap Days
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold text-green-600">
            {totalFilled}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sensor-Filled Days
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="font-mono text-2xl font-bold text-primary">
            {improvementPct}%
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Gap Recovery
          </p>
        </div>
      </div>
    </div>
  );
}
