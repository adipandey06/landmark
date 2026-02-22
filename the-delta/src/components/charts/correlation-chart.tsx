"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Correlation } from "@/lib/types";

interface CorrelationChartProps {
  data: Correlation[];
}

export function CorrelationChart({ data }: CorrelationChartProps) {
  const sorted = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={100}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 80 }}>
          <XAxis
            type="number"
            domain={[-1, 1]}
            tick={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="factor"
            tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
            tickLine={false}
            axisLine={false}
            width={75}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              fontFamily: "var(--font-geist-mono)",
              borderRadius: 8,
            }}
            formatter={(value) => [typeof value === "number" ? value.toFixed(2) : String(value), "Correlation"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.value >= 0 ? "#22c55e" : "#ef4444"}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
