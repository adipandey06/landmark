# Landmark

**Soil & water infrastructure intelligence —  HackLondon 2026**

Landmark fuses satellite imagery with IoT sensor data to monitor soil and water infrastructure across Sub-Saharan Africa, South Asia, and Southeast Asia.

We implemented Solana for Backend to verify the data that we would collect from the hardware, including sensors for pH, humidity, temperature, and salinity. Front-end runs on MapBox, React and Next.js. Our case study would be Cambodia, where we simulated what it would look like if full deployment in a country provided us with information on the deployment of LP Boards

## Routes

- `/` — Overview dashboard with global stats and advisories
- `/map` — Interactive Mapbox sensor map with clustering + satellite overlays
- `/satellite` — Fusion scores, coverage stats, soil moisture time series
- `/risk` — AI risk assessments and forecasts
- `/audit` — Blockchain-verified audit trail

## Tech

Next.js 16 · React 19 · TypeScript 5 · Mapbox GL v3 · Recharts · Radix UI + Tailwind 4 · Zustand · TanStack Query

## Running it

```bash
npm install
npm run dev
```

You'll need a Mapbox token — stick it in `.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

Then open [localhost:3000](http://localhost:3000).

## Project layout

```
src/
├── app/              # pages
├── components/       # map, satellite, charts, ui
├── hooks/            # react query wrappers
└── lib/
    ├── api/          # mock api clients
    ├── mock-data/    # deterministic data generators
    ├── stores/       # zustand (map-store.ts)
    └── types/        # typescript types
```

## Mock data

~60 sensors across 3 regions, ~40 risk assessments, 3 NASA GIBS satellite layers, and fake blockchain signatures. Everything's generated deterministically in `src/lib/mock-data/`.

## Map stuff

The map lives in `src/components/map/sensor-map.tsx` and is loaded client-side only (Mapbox needs `window`). Uses Mapbox Standard style with a dusk preset, native GeoJSON clustering, and GPU-driven hover via `feature-state`. NASA GIBS overlays sit below labels, sensors sit above.

## Useful files

- Map: `src/components/map/sensor-map.tsx`
- Mock data: `src/lib/mock-data/`
- Store: `src/lib/stores/map-store.ts`
- Full architecture notes: `CLAUDE.md`
