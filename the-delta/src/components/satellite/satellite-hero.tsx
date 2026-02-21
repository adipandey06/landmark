import { Satellite } from "lucide-react";

export function SatelliteHero() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/10 px-8 py-12">
      <div className="absolute top-6 right-8 text-primary/[0.06]">
        <Satellite className="h-28 w-28" strokeWidth={1} />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Satellite &times; Sensor Fusion
      </p>
      <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight md:text-4xl">
        Ground-Truth Enhanced Satellite Intelligence
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Fusing NASA satellite imagery with IoT sensor ground truth to deliver
        higher-accuracy soil moisture, vegetation, and precipitation analytics.
        Ground-truth sensors fill the gaps that cloud cover, revisit cycles, and
        spatial resolution leave in satellite-only estimates.
      </p>
    </div>
  );
}
