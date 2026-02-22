FRONTEND FEATURE DISCUSSION — Plan for the-delta

Purpose
This document captures a Socratic discussion template and the migration plan to align `the-delta` frontend with Smart_Farming best practices. Use it to refine design decisions and create implementation tasks.

How to use
- For each feature: answer the Questions with your team.
- Record decisions and use the Acceptance criteria to gate implementation.


Features
- Realtime client (`src/lib/realtime.ts` or `src/lib/supabase.ts`)
- Central typed API (`src/lib/api/index.ts`, `src/lib/types.ts`)
- React Query DevTools (`src/components/providers.tsx`)
- Env & Docs (`.env.example`, `README.md`, `FRONTEND_ARCHITECTURE.md`)
- Map feature refactor (`src/features/map/Map.tsx`, `src/features/map/useMapState.ts`)
- UI primitives (`src/components/ui/*`)
- Subscription fallback pattern (`src/hooks/use-sensors.ts`)
- CI & linting (`.github/workflows/ci.yml`, `package.json`)
- Hook tests (`tests/hooks/use-sensors.test.ts`)


Discussion template (use per feature)
- Goal: concise purpose.
- Acceptance: minimal measurable criteria.
- Socratic questions: decision-driving prompts to answer before implementation.


Realtime client
Goal: Provide a single abstraction for live updates and publish/subscribe behavior.
Acceptance: Subscribes to a topic, exposes `subscribe`/`publish`, auto-reconnects, and is used by at least one hook.

Questions
- What transport will we standardize on (Supabase realtime, MQTT-over-HTTP, plain WebSocket, or backend relay)? Why?
- Which responsibilities belong to the client: subscription management, message parsing, auth refresh, or only raw socket I/O?
- How should the client expose events to React (callbacks, EventEmitter, Observable)? Why that API?
- What backpressure / rate-limiting or batching rules do we need for sensor floods?
- How will we secure the connection and rotate credentials in production?
- When a message arrives, who is responsible for applying it to React Query cache vs local state?
- How will we simulate/mock the realtime client in tests and local dev?
- What retries/backoff policy is acceptable for reconnection?


Central typed API
Goal: Single, typed layer for all backend requests and response shapes.
Acceptance: All hooks call `src/lib/api/*` functions; types live in `src/lib/types.ts`.

Questions
- Which domain models require TypeScript types first (sensor reading, relay command, map feature)?
- Should `api` functions return raw responses or normalized objects ready for UI consumption?
- How will errors be represented (throws vs structured error objects) and handled in hooks?
- Do we need an HTTP client wrapper for headers, auth refresh, and retries?
- Which endpoints should be wrapped as individual functions vs a generic `api.request()`?
- How will we version API calls to safely roll out backend changes?
- Should we embed runtime validation (zod/io-ts) at the API layer or rely on backend contracts?


React Query DevTools
Goal: Improve dev debugging with Query DevTools visible only in development.
Acceptance: DevTools mount conditionally in `Providers` and do not ship in production.

Questions
- Enable DevTools via `NODE_ENV` or a feature-flag env var?
- Where should DevTools appear (floating overlay or dedicated `/debug` route)?
- Do we want a small internal debug page summarizing active queries/subscriptions?
- Any privacy/security concerns exposing data in DevTools on shared dev environments?


Env & Docs
Goal: Clear developer onboarding and runtime config (`.env.example`, `README.md`, `FRONTEND_ARCHITECTURE.md`).
Acceptance: `.env.example` lists required keys; docs explain zustand vs React Query and how to run locally.

Questions
- Which environment variables are required vs optional for local dev?
- Provide example/test credentials (mock) or only placeholders?
- What minimal troubleshooting steps should the README include?
- Do we need a short architecture diagram or text explaining realtime + query interplay?
- Who is the target audience for `FRONTEND_ARCHITECTURE.md` (new devs, maintainers, contributors)?


Map feature refactor
Goal: Isolate map rendering and state into `src/features/map/` with pure hooks and minimal rerenders.
Acceptance: `Map` component uses `useMapState` for geometry and handlers; heavy computations live in hooks.

Questions
- What state belongs to the map (viewport, selected feature, drawn layers) vs global app state?
- Should map events update React Query caches or only local store?
- How will live sensor markers from realtime data be layered—directly in map or via queries?
- Are Mapbox tokens sensitive env vars and how will they be stored?
- If performance becomes an issue, will we memoize or use Web Workers?
- What API should `Map` expose to parents (callbacks, refs)?


UI primitives
Goal: Central `src/components/ui/` for consistent styling and accessibility wrappers.
Acceptance: Buttons, Modal, Card components standardized and used across pages.

Questions
- What design tokens or Tailwind tokens must primitives honor (spacing, colors, radii)?
- Wrap `shadcn`/Radix primitives or use them directly in feature code?
- How will theming and responsive variants be handled (CSS variables, Tailwind variants)?
- What accessibility contract must every primitive meet (ARIA roles, keyboard focus)?
- Will primitives accept `className` and `as` polymorphic prop for composition?
- How to evolve primitives without breaking consumers (deprecation strategy)?


Subscription fallback pattern
Goal: Graceful fallback: prefer realtime, otherwise use React Query polling.
Acceptance: Hooks attempt subscription; on failure set `refetchInterval` and surface status to UI.

Questions
- What counts as “subscription failure” (initial connect error, long inactivity, auth error)?
- What fallback intervals are acceptable for different data types?
- Who toggles fallback: the hook, `Providers`, or a global reconnection manager?
- How will the UI indicate degraded realtime state to the user?
- Should polling be adaptive based on visibility (tab hidden) or battery constraints?
- How to avoid duplicate updates if subscription and polling overlap?


CI & linting
Goal: Add a lightweight CI that runs lint and build on PRs.
Acceptance: GitHub Actions installs, lints, and builds; PRs fail when lint/build fail.

Questions
- Which checks must run on PRs (lint, typecheck, build, tests)?
- Run CI on every push or only PRs to main?
- Auto-fix style issues or fail job to force fixes?
- Time/cost limits on CI (avoid expensive e2e runs)?
- Who will maintain the CI when Next versions change?


Hook tests
Goal: Unit tests for critical hooks (`use-sensors`, subscription fallback).
Acceptance: Tests use mocked `realtime` client and mocked fetch responses; verify cache updates and fallback.

Questions
- Which hooks provide the highest ROI for tests (data-critical or complex logic)?
- Prefer Jest + RTL or Vitest for speed and Next compatibility?
- How to mock the realtime client API consistently across tests?
- Should tests assert UI integration or only hook behavior?
- What CI gating threshold do we want for tests: required or advisory?


Migration mapping (recommended changes)

M1 — Add Supabase realtime client (High, 6h)
Affected:
- `package.json` (add `@supabase/supabase-js`)
- `src/lib/supabase.ts` (new) — wrapper for client, subscribe/publish, reconnect
- `src/lib/api/sensors.ts` (new/replace) — typed fetch + subscribe helpers
- `src/hooks/use-sensors.ts` (update) — combine React Query + subscription
- `src/components/providers.tsx` (init & provide client)
Env:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
Acceptance:
- Can subscribe to sensor channel and update React Query cache on events.
Notes:
- Provide fallback to polling if subscription unavailable.

M2 — Add React Query DevTools (Low, 1h)
Affected:
- `package.json` (devDependency `@tanstack/react-query-devtools`)
- `src/components/providers.tsx` (conditionally import and render DevTools in development)
Acceptance:
- DevTools appear in dev environment only; no production bundle change.

M3 — `.env.example` + README quickstart (Medium, 2h)
Affected:
- `.env.example` (new)
- `README.md` (update)
- `FRONTEND_ARCHITECTURE.md` (new)
Suggested keys:
- NEXT_PUBLIC_API_BASE_URL=
- NEXT_PUBLIC_MQTT_SERVICE_BASE_URL=
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
Acceptance:
- New dev can start with cp .env.example .env.local and run dev server.

M4 — Centralize API + typed models (Medium, 4h)
Affected:
- `src/lib/types.ts` (new) — define Sensor, RelayCommand, MapFeature, API errors
- `src/lib/api/index.ts` (new) — typed wrappers: fetchSensors, postRelayCommand, fetchMapFeatures
- `src/hooks/*.ts` (update) — use wrapped functions not ad-hoc fetches
Acceptance:
- Hooks receive typed data; uniform error handling; central place for retries/headers.
Notes:
- Consider runtime validation (zod) later.

M5 — Subscription fallback & tests (Medium, 6h)
Affected:
- `src/hooks/use-sensors.ts` (update) — try subscribe then fallback to React Query refetchInterval
- `src/lib/supabase.ts` (ensure it exposes connection status events)
- `tests/hooks/use-sensors.test.ts` (new)
Acceptance:
- On subscription failure, queries set refetchInterval and UI shows degraded state.
Notes:
- Tests should assert cache updates on mock realtime events and fallback intervals.

M6 — Dev debug page & CI (Low–Medium, 3h)
Affected:
- `src/app/debug/page.tsx` (new)
- `.github/workflows/ci.yml` (new)
- `package.json` (ensure lint/build scripts exist)
Acceptance:
- PRs trigger lint+build; debug page visible in dev only.
Notes:
- Keep CI minimal to avoid long run-times.


Next steps
1. Review and answer the Socratic questions in each feature section.
2. Convert answers into implementation tasks and estimate work per task.
3. Implement in priority order (M1 → M5 → M4 → M6) or as agreed.


-- end of plan
