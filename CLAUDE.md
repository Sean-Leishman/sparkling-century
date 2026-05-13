# satellite

## Purpose

A small SvelteKit experiment that fetches nearby satellite positions from the
n2yo "satellites above" API and renders them as points around a green sphere
("Earth") in a Three.js scene. The client polls a same-origin API route every
10 seconds and updates per-satellite state, with a sketched-out hook for
velocity tracking. It is an early prototype rather than a finished app.

## Tech stack

- SvelteKit 2 (Svelte 4) with TypeScript
- Vite 5 for dev/build
- Three.js (`three` ^0.160) for 3D rendering
- Vitest for tests
- ESLint + Prettier for lint/format
- `@sveltejs/adapter-auto` (no specific deploy target chosen)

## Key files / entry points

- `src/routes/+page.svelte` - canvas page; mounts the scene and polls the API
- `src/routes/+page.server.ts` - server `load` that prefetches satellites
- `src/routes/api/satellite/+server.ts` - GET endpoint, refreshes data every 10s
- `src/lib/server/api.ts` - calls `api.n2yo.com` using `SWOP_API_KEY`
- `src/lib/scene.ts` - Three.js scene setup (sphere + per-satellite planes)
- `src/lib/state.ts` - `State` / `SatelliteState`, lat/lng/alt to world coords
- `src/app.html`, `static/favicon.png` - shell and asset
- `svelte.config.js`, `vite.config.ts`, `tsconfig.json` - tooling config
- `.env` - holds `SWOP_API_KEY` (currently committed; treat as a dev key)

## How to run / dev

```bash
npm install
npm run dev          # vite dev server
npm run build        # production build
npm run preview      # preview the production build
npm run check        # svelte-check type pass
npm run test         # vitest
npm run lint         # prettier --check + eslint
npm run format       # prettier --write
```

The server route reads `SWOP_API_KEY` from `$env/static/private`, so a value
must be present in `.env` before `npm run dev`.

## Conventions noticed

- Path alias `$lib` is used throughout; server-only code lives in
  `src/lib/server`.
- Indentation in source files is 4 spaces, while config files use tabs (matches
  the SvelteKit template default).
- API polling interval is hard-coded to 10 seconds in two places
  (`+page.svelte` and `api/satellite/+server.ts`).
- Observation location (lat/lng/alt/radius) for the n2yo query is hard-coded in
  `src/lib/server/api.ts`.

## Honest gaps

- README is the unmodified `create-svelte` template; nothing project-specific.
- `src/lib/scene.ts` references an undefined `api` inside `updateVelocity`, and
  the `animate` loop has an empty per-satellite body with a `// EKF for
measurement/motion model` comment - the Kalman filter / motion update is not
  implemented.
- `src/lib/index.ts` exists as a placeholder (re-export stub).
- The `.env` file is committed with what looks like a real API key; this should
  probably be rotated and gitignored.
- The n2yo URL builds the query string with `&apiKey=...` instead of `?apiKey=`
  after `category_id`, which looks like a bug in `src/lib/server/api.ts`.
- No CI, no deploy adapter chosen beyond `adapter-auto`.
