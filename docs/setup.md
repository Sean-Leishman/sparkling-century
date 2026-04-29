# Setup

## Prerequisites

- Node.js (version compatible with Vite 5 / SvelteKit 2 - Node 18+ is a safe
  bet)
- npm (the lockfile in the repo is `package-lock.json`)
- An n2yo API key for the "satellites above" endpoint

## Install

```bash
npm install
```

## Environment

The server reads `SWOP_API_KEY` via `$env/static/private`, so a value must be
defined before the dev or build server starts.

`.env` (gitignored in most setups, but currently committed in this repo):

```
SWOP_API_KEY="your-n2yo-api-key"
```

If you clone fresh and the `.env` is missing, create one with the variable
above. The key the repo ships with may not be valid; replace it if requests
start failing.

## Scripts

From `package.json`:

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `vite dev` | Start the SvelteKit dev server |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Serve the production build locally |
| `check` | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json` | Type-check Svelte + TS |
| `check:watch` | same with `--watch` | Continuous type-check |
| `test` | `vitest` | Run unit tests (only `src/index.test.ts` exists) |
| `lint` | `prettier --check . && eslint .` | Lint pass |
| `format` | `prettier --write .` | Apply formatting |

## Running it

```bash
npm run dev
# then open the URL Vite prints (usually http://localhost:5173)
```

The page will:

- Render an `<h1>` and the satellite payload as JSON-ish text.
- Mount a `<canvas>` and create a Three.js scene with a green sphere and one
  small plane per satellite returned by n2yo.
- Re-fetch `/api/satellite` every 10 seconds.

The server endpoint also runs its own 10-second `setInterval` to keep a cached
copy of the last satellite payload.

## Notes / gotchas

- The observation point (lat/lng/alt/radius) is hard-coded in
  `src/lib/server/api.ts`. To see different satellites, edit those constants.
- `src/lib/server/api.ts` builds the URL as
  `.../{category_id}&apiKey=...`. If the API rejects requests, that
  `&` should probably be `?`.
- No deployment adapter is selected beyond `@sveltejs/adapter-auto`. To deploy
  to a specific target, swap the adapter in `svelte.config.js`.
- The `.env` file is committed with what looks like a real key. If you intend
  to share or push the repo, rotate that key and add `.env` to `.gitignore`.
