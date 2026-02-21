"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SensorFilter, Region, SensorStatus, SensorType } from "@/lib/types";
import { REGION_LABELS } from "@/lib/types";

interface MapFilterBarProps {
  filter: SensorFilter;
  onFilterChange: (filter: SensorFilter) => void;
}

export function MapFilterBar({ filter, onFilterChange }: MapFilterBarProps) {
  const set = (key: keyof SensorFilter, value: string | undefined) => {
    onFilterChange({ ...filter, [key]: value === "all" ? undefined : value });
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-background/80 p-3 shadow-lg backdrop-blur-md md:left-auto md:right-4 md:w-auto md:flex-nowrap">
      <Input
        placeholder="Search sensors..."
        value={filter.search ?? ""}
        onChange={(e) => set("search", e.target.value || undefined)}
        className="h-8 w-full font-mono text-xs md:w-40"
      />
      <Select
        value={filter.region ?? "all"}
        onValueChange={(v) => set("region", v as Region)}
      >
        <SelectTrigger className="h-8 w-full font-mono text-xs md:w-36">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {Object.entries(REGION_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filter.status ?? "all"}
        onValueChange={(v) => set("status", v as SensorStatus)}
      >
        <SelectTrigger className="h-8 w-full font-mono text-xs md:w-28">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="offline">Offline</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filter.type ?? "all"}
        onValueChange={(v) => set("type", v as SensorType)}
      >
        <SelectTrigger className="h-8 w-full font-mono text-xs md:w-32">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="water-quality">Water Quality</SelectItem>
          <SelectItem value="flow-rate">Flow Rate</SelectItem>
          <SelectItem value="pressure">Pressure</SelectItem>
          <SelectItem value="level">Level</SelectItem>
          <SelectItem value="turbidity">Turbidity</SelectItem>
          <SelectItem value="soil-moisture">Soil Moisture</SelectItem>
          <SelectItem value="soil-temperature">Soil Temp</SelectItem>
          <SelectItem value="soil-ph">Soil pH</SelectItem>
          <SelectItem value="conductivity">Conductivity</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
