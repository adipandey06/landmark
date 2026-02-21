# The Delta — Project Context

Soil & water infrastructure intelligence platform. Fuses NASA satellite imagery with IoT sensor ground truth for monitoring across Sub-Saharan Africa, South Asia, and Southeast Asia. Built for HackLondon.

## Stack

- **Framework:** Next.js 16.1.6 (App Router), React 19, TypeScript 5
- **Map:** Leaflet + react-leaflet + react-leaflet-cluster (OSM tiles, no API key)
- **Charts:** Recharts 3.7
- **UI:** Radix UI (shadcn pattern), Tailwind CSS 4, Lucide icons, Geist font
- **State:** Zustand 5, TanStack React Query 5
- **Data:** All mock — no backend. Mock generators in `src/lib/mock-data/`

## Routes (5)

| Route | Page file | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Overview dashboard with hero, stats, advisories |
| `/map` | `src/app/map/page.tsx` | Leaflet sensor map with clustering, satellite overlays |
| `/satellite` | `src/app/satellite/page.tsx` | Satellite intelligence: fusion scores, coverage, soil moisture, gap timeline |
| `/risk` | `src/app/risk/page.tsx` | AI risk assessments with forecasts and correlations |
| `/audit` | `src/app/audit/page.tsx` | Blockchain-verified audit trail |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # Radix/shadcn primitives (button, card, badge, select, etc.)
│   ├── layout/             # sidebar.tsx, top-nav.tsx, app-shell.tsx, section-heading.tsx
│   ├── map/                # sensor-map.tsx, map-filter-bar.tsx, sensor-detail-panel.tsx, satellite-layer-control.tsx
│   ├── satellite/          # satellite-hero, fusion-score-cards, coverage-analysis, soil-moisture-dashboard, gap-analysis-timeline
│   ├── charts/             # risk-overview-bar, risk-table, risk-detail-view, forecast-chart, correlation-chart, risk-filter-bar
│   ├── overview/           # hero-section, global-stats-grid, recent-advisories, region-summary-cards, role-specific-section, verification-summary
│   ├── shared/             # error-state.tsx, empty-state.tsx
│   ├── verification/       # verification-badge.tsx
│   ├── skeletons/          # index.tsx (loading states)
│   └── providers.tsx       # React Query + context providers
├── hooks/                  # use-sensors, use-risks, use-audit, use-stats (React Query wrappers)
├── lib/
│   ├── types/              # common.ts, sensor.ts, risk.ts, audit.ts, stats.ts, satellite.ts, index.ts (barrel)
│   ├── api/                # client.ts, sensors.ts, risks.ts, audit.ts, stats.ts (mock API layer)
│   ├── mock-data/          # generators.ts, sensors.ts, risks.ts, audit-events.ts, satellite.ts
│   └── utils/              # format.ts, geo.ts, solana.ts
└── contexts/               # role-context.tsx
```

## Key Types

**Sensor types:** `water-quality | flow-rate | pressure | level | turbidity | soil-moisture | soil-temperature | soil-ph | conductivity`

**SensorMetrics:** Always has `ph, turbidity, dissolvedOxygen, temperature, flowRate, pressure`. Soil sensors additionally have optional `soilMoisture, soilTemperature, soilPh, electricalConductivity`.

**Risk categories:** `contamination | infrastructure-failure | drought | flooding | supply-disruption | soil-degradation | salinity-intrusion | nutrient-depletion`

**Satellite types:** `SatelliteLayer` (toggle/opacity for map overlays), `DataCoverageStats`, `FusionScore`, `DailyCoverage`

**Regions:** `sub-saharan-africa | south-asia | southeast-asia`

**Status:** `online | warning | offline | critical`

## Map Details

- `sensor-map.tsx` is dynamically imported with `ssr: false` (Leaflet needs `window`)
- OSM base tiles + optional NASA GIBS satellite overlays (NDVI, SMAP Soil Moisture, GPM Precipitation)
- Sensors rendered as `CircleMarker` colored by status (green/yellow/gray/red)
- Clustering via `react-leaflet-cluster` with custom `divIcon`
- Satellite layer control: collapsible panel bottom-left with toggle + opacity slider per layer
- Center: `[10, 40]`, zoom: `2.5`

## Mock Data

- **60 sensors** across 3 regions (~33% are soil type). Generated deterministically in `mock-data/sensors.ts`
- **40 risk assessments** linked to first 40 sensors
- **Satellite data:** 3 NASA GIBS layers, coverage stats per region, 4 fusion scores, 90-day daily coverage, 30-day soil moisture timeseries
- Blockchain signatures are fake base58/hex strings

## Patterns & Conventions

- All components use `"use client"` where hooks/interactivity needed; pages without client needs are server components
- Styling: Tailwind utility classes, `cn()` helper for conditional classes, font-mono for data/labels
- Monospace aesthetic: `text-[10px] uppercase tracking-widest font-mono` for labels
- Glassmorphism panels: `bg-background/80 backdrop-blur-md border-border/50`
- Recharts tooltips: always use `var(--font-geist-mono)` font, size 11
- Recharts formatters: use untyped params (e.g. `(value) =>` not `(value: number) =>`) to satisfy strict Recharts generics

## Build

```bash
npm run build   # All 5 routes compile
npm run dev     # Dev server on localhost:3000
```

No env vars required. The old `NEXT_PUBLIC_MAPBOX_TOKEN` was removed.
