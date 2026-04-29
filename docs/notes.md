# Notes

Loose observations while reading the code. Not authoritative - just things to
keep in mind when picking this back up.

## Status

- Early prototype. The visual loop runs, but most of the "interesting" logic
  (motion model, EKF, anything that uses velocity) is stubbed.
- The README is still the unmodified `create-svelte` template.

## Likely bugs / rough edges

- **n2yo URL formatting.** `src/lib/server/api.ts` does
  `.../${category_id}&apiKey=${SWOP_API_KEY}`. Looks like the `&` should be
  `?`; otherwise the API key is part of the `category_id` path segment.
- **`updateVelocity` in `scene.ts`** references an undefined `api` symbol.
  Nothing calls the function, so it does not blow up at runtime, but it will
  throw if it ever gets wired up.
- **Empty animation body.** `animate()` iterates `satellites` (the
  module-scoped array, which is never populated) and does nothing per
  iteration. There is a `// EKF for measurement/motion model` comment marking
  where work was abandoned.
- **`window.addEventListener('resize', resize)` is commented out**, so the
  canvas does not respond to window resizes after the initial load.
- **Two independent 10-second timers.** The server route refreshes every 10s
  and the client polls every 10s. Cache lifetime and poll frequency are
  coupled by accident; one of them probably wants to go.
- **Flattening factor.** `llarToWorld` sets `f = 0`, which makes the WGS84
  formula collapse to a sphere. If a real ellipsoid is wanted, set
  `f = 1/298.257223563` (or similar) and follow through.
- **`+page.server.ts`** uses `PageServerLoad` without importing the type, so
  it relies on ambient typing or simply skips the annotation at runtime.

## Security

- `.env` with `SWOP_API_KEY` is committed. The key in there should be assumed
  compromised; rotate before any public deploy.

## Open questions

- What is the intended observation location? Lat/lng `41.702 / -76.014` is
  somewhere in northern Pennsylvania - is that placeholder, or the user's
  location?
- Are satellites supposed to be drawn as billboards (currently 1cm
  `PlaneGeometry` meshes) or as proper points/sprites? They will be invisible
  at the camera distance set in `initaliseScene`.
- Where should rendered satellites get their orientation? Right now `plane`
  meshes get a `state` attribute but no `lookAt(camera)` or rotation update.

## Easy follow-ups (for future me)

- Replace the README boilerplate with one paragraph describing the app.
- Move `.env` out of git, add it to `.gitignore`, document an `.env.example`.
- Fix the `&apiKey=` -> `?apiKey=` typo and verify a real n2yo response.
- Centralize the polling interval (one constant, one timer).
- Either implement the EKF or strip the placeholder so the file isn't
  misleading.
- Decide on a deploy target and replace `adapter-auto`.
