"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VerificationBadge } from "@/components/verification/verification-badge";
import { useSensorReadings } from "@/hooks/use-sensors";
import { timeAgo, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Sensor, SensorStatus } from "@/lib/types";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANT: Record<SensorStatus, "default" | "secondary" | "destructive" | "outline"> = {
  online: "default",
  warning: "secondary",
  offline: "outline",
  critical: "destructive",
};

interface SensorDetailPanelProps {
  sensor: Sensor;
  onClose: () => void;
}

export function SensorDetailPanel({ sensor, onClose }: SensorDetailPanelProps) {
  const { data: readings, isLoading } = useSensorReadings(sensor.id);

  const chartData = readings?.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: r.value,
  }));

  return (
    <div className="absolute top-0 right-0 bottom-0 z-20 w-full overflow-y-auto border-l border-border/50 bg-background/95 shadow-xl backdrop-blur-md sm:w-96">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {sensor.id}
          </p>
          <h3 className="text-sm font-semibold">{sensor.name}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[sensor.status]}>{sensor.status}</Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {sensor.country} &middot; {sensor.region.replace(/-/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricCell label="pH" value={sensor.metrics.ph} />
          <MetricCell label="Turbidity" value={sensor.metrics.turbidity} unit="NTU" />
          <MetricCell label="DO" value={sensor.metrics.dissolvedOxygen} unit="mg/L" />
          <MetricCell label="Temp" value={sensor.metrics.temperature} unit="°C" />
          <MetricCell label="Flow" value={sensor.metrics.flowRate} unit="L/s" />
          <MetricCell label="Pressure" value={sensor.metrics.pressure} unit="bar" />
        </div>

        {sensor.metrics.soilMoisture !== undefined && (
          <>
            <Separator />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Soil Metrics
            </p>
            <div className="grid grid-cols-2 gap-3">
              <MetricCell label="Soil Moisture" value={sensor.metrics.soilMoisture} unit="%" />
              {sensor.metrics.soilTemperature !== undefined && (
                <MetricCell label="Soil Temp" value={sensor.metrics.soilTemperature} unit="°C" />
              )}
              {sensor.metrics.soilPh !== undefined && (
                <MetricCell label="Soil pH" value={sensor.metrics.soilPh} />
              )}
              {sensor.metrics.electricalConductivity !== undefined && (
                <MetricCell label="EC" value={sensor.metrics.electricalConductivity} unit="dS/m" />
              )}
            </div>
          </>
        )}

        <Separator />

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            24h Dissolved Oxygen
          </p>
          {isLoading ? (
            <Skeleton className="h-[120px] w-full rounded" />
          ) : (
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Last reading: {timeAgo(sensor.lastReading)}</p>
          <p>Installed: {formatDateTime(sensor.installedAt)}</p>
        </div>

        <VerificationBadge
          txSignature={sensor.txSignature}
          hash={sensor.dataHash}
          status="verified"
          size="md"
          showHash
        />

        <Link
          href="/risk"
          className="block text-center font-mono text-xs text-primary hover:underline"
        >
          View risk assessment &rarr;
        </Link>
      </div>
    </div>
  );
}

function MetricCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-muted/30 p-2">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold">
        {value}
        {unit && (
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
