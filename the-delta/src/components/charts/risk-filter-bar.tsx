"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RiskFilter, RiskLevel, RiskCategory, Region } from "@/lib/types";
import { REGION_LABELS } from "@/lib/types";

interface RiskFilterBarProps {
  filter: RiskFilter;
  onFilterChange: (f: RiskFilter) => void;
}

export function RiskFilterBar({ filter, onFilterChange }: RiskFilterBarProps) {
  const set = (key: keyof RiskFilter, value: string | undefined) => {
    onFilterChange({ ...filter, [key]: value === "all" ? undefined : value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filter.level ?? "all"}
        onValueChange={(v) => set("level", v as RiskLevel)}
      >
        <SelectTrigger className="h-8 w-32 font-mono text-xs">
          <SelectValue placeholder="Risk Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filter.category ?? "all"}
        onValueChange={(v) => set("category", v as RiskCategory)}
      >
        <SelectTrigger className="h-8 w-44 font-mono text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="contamination">Contamination</SelectItem>
          <SelectItem value="infrastructure-failure">Infrastructure</SelectItem>
          <SelectItem value="drought">Drought</SelectItem>
          <SelectItem value="flooding">Flooding</SelectItem>
          <SelectItem value="supply-disruption">Supply Disruption</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filter.region ?? "all"}
        onValueChange={(v) => set("region", v as Region)}
      >
        <SelectTrigger className="h-8 w-40 font-mono text-xs">
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
        value={`${filter.sortBy ?? "score"}-${filter.sortOrder ?? "desc"}`}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split("-") as [
            RiskFilter["sortBy"],
            RiskFilter["sortOrder"]
          ];
          onFilterChange({ ...filter, sortBy, sortOrder });
        }}
      >
        <SelectTrigger className="h-8 w-36 font-mono text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score-desc">Score (High first)</SelectItem>
          <SelectItem value="score-asc">Score (Low first)</SelectItem>
          <SelectItem value="assessedAt-desc">Newest first</SelectItem>
          <SelectItem value="assessedAt-asc">Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
