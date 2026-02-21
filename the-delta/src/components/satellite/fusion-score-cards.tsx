"use client";

import { MOCK_FUSION_SCORES } from "@/lib/mock-data/satellite";

export function FusionScoreCards() {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Fusion Accuracy Improvement
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_FUSION_SCORES.map((score) => (
          <div
            key={score.label}
            className="rounded-xl border border-border/50 bg-card p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {score.label}
            </p>
            <div className="mt-3 flex items-end gap-3">
              <div>
                <p className="font-mono text-2xl font-bold">{score.fusedAccuracy}%</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Fused
                </p>
              </div>
              <div className="mb-1">
                <p className="font-mono text-sm text-muted-foreground/60 line-through">
                  {score.satelliteOnlyAccuracy}%
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/60">
                  Satellite only
                </p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5">
              <span className="font-mono text-xs font-semibold text-green-600">
                +{score.improvement}%
              </span>
              <span className="ml-1.5 font-mono text-[9px] text-green-600/70">
                {score.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
