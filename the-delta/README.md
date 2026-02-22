Landmark — Soil & Water Infrastructure Intelligence

Landmark is a soil & water infrastructure intelligence platform built for HackLondon. It fuses NASA satellite imagery with IoT sensor ground truth to provide monitoring, risk insights, and auditability across Sub-Saharan Africa, South Asia, and Southeast Asia.

## Quick Overview

- Purpose: Combine satellite-derived insights with in-field IoT sensor telemetry to surface fusion scores, coverage analytics, risk forecasts, and an auditable trail of events.
- Focus regions: sub-saharan-africa, south-asia, southeast-asia
- Data: Mocked for the HackLondon demo (no backend required). Mock generators live in `src/lib/mock-data/`.

## Tech Stack

- Framework: Next.js 16 (App Router), React 19, TypeScript 5
- Map: Mapbox GL JS v3 + react-map-gl v7
- Charts: Recharts 3.7
- UI primitives: Radix UI (shadcn pattern), Tailwind CSS 4, Lucide icons
- State: Zustand 5, TanStack React Query 5

## Routes

This demo contains five main routes (App Router pages in `src/app/`):

- `/` — Overview dashboard (`src/app/page.tsx`) with hero, global stats, and advisories
- `/map` — Interactive Mapbox sensor map with clustering and satellite overlays (`src/app/map/page.tsx`)
- `/satellite` — Satellite intelligence view: fusion scores, coverage, soil moisture (`src/app/satellite/page.tsx`)
- `/risk` — AI risk assessments, forecasts and correlations (`src/app/risk/page.tsx`)
- `/audit` — Blockchain-verified audit trail (`src/app/audit/page.tsx`)

## Project Structure (high level)

src/
- app/ — Next.js pages and route folders
- components/ — UI, layout, map, satellite, charts, shared components
- hooks/ — React Query wrappers: `use-sensors`, `use-risks`, `use-audit`, `use-stats`
- lib/
  - api/ — mock API clients
  - mock-data/ — deterministic generators for sensors, risks, satellite, audit events
  - stores/ — `map-store.ts` (Zustand)
  - types/ — project types (sensor, satellite, risk, audit, stats)

See the `CLAUDE.md` attachment for a fuller, annotated architecture map.

## Map & Spatial Details

- `sensor-map.tsx` is dynamically imported with `ssr: false` (Mapbox requires `window`).
- Map style: Mapbox Standard with a dusk preset and 3D pitch.
- Sensors rendered as Mapbox `circle` layers, colored by status via `match` expressions.
- Uses Mapbox native GeoJSON clustering (`cluster: true`) with `step` expressions for cluster size/color.
- Hover interactions use `feature-state` (GPU-driven). Click handling uses `queryRenderedFeatures` to expand clusters or select sensors.
- Satellite overlays (NASA GIBS) are rendered below labels/buildings; sensor layers are above.
- Controls: custom zoom, reset north, and reset view (bottom-right).
- Requires `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local` for full map rendering.

## Mock Data Summary

- ~60 sensors across 3 regions (roughly 33% soil sensors). Generated deterministically in `src/lib/mock-data/sensors.ts`.
- ~40 risk assessments (linked to sensors).
- Satellite: 3 NASA GIBS layers, regional coverage stats, fusion scores, daily coverage time series, and soil moisture timeseries.
- Blockchain signatures and audit trails are mocked base58/hex strings for the demo.

## Conventions & Patterns

- Components: use `"use client"` where hooks or interactivity are required; otherwise prefer server components for pages.
- Styling: Tailwind utility classes with a `cn()` helper for conditional classes.
- Monospace styling is used for small data labels (`text-[10px] uppercase tracking-widest font-mono`).
- Glassmorphism panels: `bg-background/80 backdrop-blur-md border-border/50`.
- Recharts: tooltips use the Geist mono font and size 11; formatters use untyped params to satisfy strict generic signatures.

## Key Types (summary)

- Sensor types: `water-quality | flow-rate | pressure | level | turbidity | soil-moisture | soil-temperature | soil-ph | conductivity`
- SensorMetrics: always include `ph, turbidity, dissolvedOxygen, temperature, flowRate, pressure`. Soil sensors optionally include `soilMoisture, soilTemperature, soilPh, electricalConductivity`.
- Risk categories: `contamination | infrastructure-failure | drought | flooding | supply-disruption | soil-degradation | salinity-intrusion | nutrient-depletion`
- Regions: `sub-saharan-africa | south-asia | southeast-asia`
- Status: `online | warning | offline | critical`

## Development & Build

Environment:

- Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` to enable Mapbox rendering.

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Both `npm run dev` and `npm run build` assume a standard Node.js environment supported by the Next.js version in package.json.

## Where to look next

- Map code: `src/components/map/sensor-map.tsx` and `src/components/map/layers/`
- Mock data: `src/lib/mock-data/`
- Stores: `src/lib/stores/map-store.ts`

If you'd like, I can also:
- run a quick smoke-check by opening `README.md` and verifying the new content, or
- add a short Getting Started section with environment examples for Windows.

---
Updated to reflect the project's current architecture and demo-focused mock-data setup.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
