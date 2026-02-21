"use client";

import { useState } from "react";
import { Satellite, ChevronUp, ChevronDown } from "lucide-react";
import type { SatelliteLayer } from "@/lib/types";

interface SatelliteLayerControlProps {
  layers: SatelliteLayer[];
  onToggle: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
}

export function SatelliteLayerControl({
  layers,
  onToggle,
  onOpacityChange,
}: SatelliteLayerControlProps) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = layers.filter((l) => l.visible).length;

  return (
    <div className="absolute bottom-6 left-4 z-10 w-64 rounded-xl border border-border/50 bg-background/80 shadow-lg backdrop-blur-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Satellite className="h-4 w-4 text-primary" />
        <span className="flex-1 font-mono text-xs uppercase tracking-wider">
          Satellite Layers
        </span>
        {activeCount > 0 && (
          <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            {activeCount}
          </span>
        )}
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-1 border-t border-border/50 px-3 py-2">
          {layers.map((layer) => (
            <div key={layer.id} className="space-y-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => onToggle(layer.id)}
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                <span className="flex-1 font-mono text-[11px]">
                  {layer.name}
                </span>
              </label>
              {layer.visible && (
                <div className="flex items-center gap-2 pl-5">
                  <span className="font-mono text-[9px] text-muted-foreground">
                    Opacity
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(layer.opacity * 100)}
                    onChange={(e) =>
                      onOpacityChange(layer.id, Number(e.target.value) / 100)
                    }
                    className="h-1 flex-1 accent-primary"
                  />
                  <span className="w-7 font-mono text-[9px] text-muted-foreground">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              )}
              <p className="pl-5 font-mono text-[9px] text-muted-foreground/70">
                {layer.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
