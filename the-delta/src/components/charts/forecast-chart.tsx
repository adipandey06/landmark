"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { ForecastPoint } from "@/lib/types";

interface ForecastChartProps {
  data: ForecastPoint[];
}

const RANGES = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
];

export function ForecastChart({ data }: ForecastChartProps) {
  const [range, setRange] = useState(14);
  const filtered = data.slice(0, range);

  const chartData = filtered.map((p) => ({
    date: p.date.slice(5),
    predicted: p.predicted,
    lower: p.lower,
    upper: p.upper,
    band: [p.lower, p.upper],
  }));

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {RANGES.map((r) => (
          <Button
            key={r.days}
            variant={range === r.days ? "default" : "outline"}
            size="sm"
            className="h-6 font-mono text-[10px]"
            onClick={() => setRange(r.days)}
          >
            {r.label}
          </Button>
        ))}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={100}>
          <AreaChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                fontFamily: "var(--font-geist-mono)",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="var(--color-primary)"
              fillOpacity={0.08}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="var(--color-primary)"
              fill="none"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
