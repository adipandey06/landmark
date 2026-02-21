"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useMapStore } from "@/lib/stores/map-store";
import { PALETTES, type PaletteKey } from "@/lib/utils/color-scales";
import { cn } from "@/lib/utils";

const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

function getTierLabel(zoom: number): string {
  if (zoom < 5) return "Country Overview";
  if (zoom < 10) return "Regional Detail";
  return "Local Sensors";
}

export function MapLegend() {
  const legendOpen = useMapStore((s) => s.legendOpen);
  const toggleLegend = useMapStore((s) => s.toggleLegend);
  const activePalette = useMapStore((s) => s.activePalette);
  const setActivePalette = useMapStore((s) => s.setActivePalette);
  const overlayOpacity = useMapStore((s) => s.overlayOpacity);
  const setOverlayOpacity = useMapStore((s) => s.setOverlayOpacity);
  const overlayVisible = useMapStore((s) => s.overlayVisible);
  const toggleOverlay = useMapStore((s) => s.toggleOverlay);
  const zoom = useMapStore((s) => s.viewState.zoom);

  const palette = PALETTES[activePalette];
  const tierLabel = getTierLabel(zoom);

  return (
    <div className="absolute bottom-20 left-4 z-10 w-52 rounded-lg border border-border/50 bg-background/85 backdrop-blur-md shadow-lg">
      {/* Tier label */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0">
        <span className="font-mono text-[9px] uppercase tracking-widest text-primary/70">
          {tierLabel}
        </span>
      </div>

      {/* Header */}
      <button
        onClick={toggleLegend}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {palette.name}
        </span>
        {legendOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {legendOpen && (
        <div className="space-y-3 border-t border-border/50 px-3 pb-3 pt-2">
          {/* Color swatches */}
          <div className="space-y-1">
            {palette.colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-3 w-5 rounded-sm"
                  style={{ backgroundColor: color, opacity: overlayOpacity }}
                />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {palette.labels[i]}
                </span>
              </div>
            ))}
          </div>

          {/* Palette switcher */}
          <div className="flex gap-1">
            {PALETTE_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setActivePalette(key)}
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest transition-colors",
                  key === activePalette
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Opacity slider */}
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Opacity
            </span>
            <input
              type="range"
              min={0.3}
              max={0.9}
              step={0.05}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="h-1 w-full cursor-pointer accent-foreground"
            />
          </div>

          {/* Visibility toggle */}
          <button
            onClick={toggleOverlay}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            {overlayVisible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
            {overlayVisible ? "Visible" : "Hidden"}
          </button>
        </div>
      )}
    </div>
  );
}
