"use client";

import { Map as MapIcon, Layers, ChevronDown } from "lucide-react";
import { useMapStore } from "@/lib/stores/map-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { METRIC_CONFIGS } from "./layers/cambodia-grid-layer";

export function GridLayerControl() {
  const gridVisible = useMapStore((s) => s.gridVisible);
  const toggleGridVisible = useMapStore((s) => s.toggleGridVisible);
  const gridMetric = useMapStore((s) => s.gridMetric);
  const setGridMetric = useMapStore((s) => s.setGridMetric);

  const activeConfig = METRIC_CONFIGS[gridMetric];

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-xl border border-border/50 bg-background/80 p-3 shadow-lg backdrop-blur-md w-64">
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Cambodia Grid</span>
        </div>
        <Switch
          checked={gridVisible}
          onCheckedChange={toggleGridVisible}
          aria-label="Toggle Regional Grid"
        />
      </div>

      {gridVisible && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2">
          <span className="text-xs text-muted-foreground mb-1 block">Active Metric</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between h-8">
                <span className="truncate">{activeConfig?.label ?? "Select Metric"}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[230px]">
              {Object.entries(METRIC_CONFIGS).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setGridMetric(key)}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{config.label}</span>
                  {gridMetric === key && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mt-4 space-y-2">
             <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{configRangeLabels(activeConfig)?.[0]}</span>
                <span>{configRangeLabels(activeConfig)?.[1]}</span>
             </div>
             <div className="h-1.5 w-full rounded-full overflow-hidden flex">
                {activeConfig?.colors.map((color, i) => (
                    <div 
                        key={i} 
                        className="h-full flex-1" 
                        style={{ backgroundColor: color }} 
                    />
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to grab min/max labels for the legend
function configRangeLabels(config: any): [string, string] {
    if (!config) return ["Min", "Max"];
    if (config.label === "Risk Level") return ["Low Risk", "Critical Risk"];
    
    const d = config.domain;
    if (!d || d.length === 0) return ["Min", "Max"];
    return [d[0].toString(), d[d.length - 1].toString()];
}
