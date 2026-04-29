# Architecture

A small SvelteKit app that visualizes satellites near a hard-coded ground
location using Three.js. There are two pieces: a server side that talks to
n2yo, and a client side that renders a 3D scene and polls for updates.

## Data flow

1. On request, `src/routes/+page.server.ts` runs a `load` function that calls
   `getSatellites()` and returns the result to the page.
2. `src/routes/+page.svelte` receives that data as `data`, mounts the canvas,
   constructs a `State` from `data`, and starts a `setInterval` that re-fetches
   `/api/satellite` every 10 seconds.
3. `src/routes/api/satellite/+server.ts` keeps a module-scoped `data` object
   warm by running `fetchData()` on its own 10-second `setInterval`. The `GET`
   handler returns the most recent value as `{ body: data }`.
4. `src/lib/server/api.ts` calls
   `https://api.n2yo.com/rest/v1/satellite/above/{lat}/{lng}/{alt}/{radius}/{category_id}&apiKey=...`
   with `SWOP_API_KEY` from `$env/static/private`.

## Modules

### `src/lib/server/api.ts`

- Single export `getSatellites()`.
- Hard-codes `lat=41.702`, `lng=-76.014`, `alt=0`, `radius=90`,
  `category_id=0`.
- Wraps the fetch in try/catch; on failure logs and returns `{}`.
- Note: the URL uses `&apiKey=` instead of `?apiKey=`, which looks unintended.

### `src/lib/state.ts`

- `llarToWorld(lat, lng, alt, rad)` converts lat/lng/alt to a unit-Earth XYZ
  using a flattening factor `f = 0` (so it is currently a spherical model).
  Coordinates are normalized by `EARTH_RADIUS` (6 378 137 m).
- `SatelliteState` holds `(x, y, z)`, a velocity triple `(x2, y2, z2)`, an
  `id`, a `name`, and a `timestamp`. `updateVelocity()` does a finite-difference
  velocity from the previous position and timestamp.
- `State` constructs `SatelliteState`s from the n2yo `above` array, keyed by
  `satid`, and exposes an iterator. `updateState()` updates velocities for
  known satellites and logs unknown IDs.

### `src/lib/scene.ts`

- `createScene(el, data)` is the entry; sets up `THREE.WebGLRenderer`, calls
  `initaliseScene(state)`, runs `resize()` once, then starts `animate()`.
- The scene contains one green sphere of radius `0.5` at the origin (Earth) and
  one tiny `PlaneGeometry` mesh per satellite, positioned by `(x, y, z)`.
- `animate()` requests frames in a loop. It iterates `satellites` but the body
  is empty - there is a placeholder comment `// EKF for measurement/motion
  model`. The motion model is not implemented.
- `updateVelocity()` references an undefined `api` symbol; it is unused.
- `window.addEventListener('resize', resize)` is commented out.

### `src/routes/+page.svelte`

- Receives `data` from the server load.
- On mount: calls `fetchData()`, constructs `state = new State(data)`, sets a
  10-second polling interval, and calls `createScene(el, state)`.
- Renders an `<h1>`, the SvelteKit links, the raw `data` value, and a
  `<canvas>` bound to `el`.

## External dependency

- n2yo "satellites above" API. Requires `SWOP_API_KEY` in `.env`; the server
  reads it via `$env/static/private`.

## Things that are missing or unfinished

- Any real motion/measurement model (the EKF is a TODO).
- Resize handling at the window level.
- Robust error handling - both the client and server return `{}` on failure
  and the page does not currently degrade.
- Any persistence; everything lives in module-scoped variables.
