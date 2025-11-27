# Option 2 (MF-Native RSC Actions) – Execution Plan

Goal: execute remote “use server” modules in-process via Module Federation, without HTTP forwarding, while keeping HTTP as a safe fallback. This must work for RSC, SSR, client hydration, shared packages, and layered share scopes.

## Outcomes
- Host can `getServerAction(id)` for remote actions loaded via MF.
- No filesystem coupling; remotes discovered over HTTP via MF manifest data.
- Layer-aware sharing preserved (rsc vs client).
- Tests cover MF-native path plus fallback to HTTP.

## Workstream A – Remote publishes the right metadata
1) **MF manifest extraData**: ensure remote (e.g., app2) publishes in `manifest.additionalData`:
   - `rsc.serverActionsManifest`, `rsc.clientManifest`, `rsc.remote.url`, `rsc.remote.serverContainer`, `rsc.remote.actionsEndpoint`.
   - `rsc.exposeTypes` marking `./server-actions` as `server-action`.
2) **Public paths**: remoteEntry.server.js, mf-stats.json, manifests all served over HTTP (no fs paths).
3) **Share scopes**: keep `shareScope: 'rsc'` for server layer, `'client'` for browser; include `react`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-server-dom-webpack/server`.

## Workstream B – Host runtime plugin wiring
1) **Runtime plugin** (rscRuntimePlugin):
   - On remote load, read MF manifest extraData (or mf-stats fallback).
   - Fetch `serverActionsManifest` URL; cache by URL.
   - For `server-actions` exposes, call `registerServerReference(fn, id, exportName)` for every manifest entry belonging to that remote.
   - Use `resolveShare` / `loadShare` hooks to map to the correct shareScope based on issuer layer (rsc vs client), avoiding alias hacks.
2) **Host RSC entry**: ensure host imports remote `server-actions` so MF loads the container in the RSC layer (or trigger via lazy load during first request).
3) **Option ordering** in `/react` handler:
   - Try `getServerAction(id)` (populated by runtime plugin).
   - If missing and remote match → HTTP forward (Option 1) as fallback.

## Workstream C – Loader & plugin alignment
1) **rsc-server-loader**: when processing MF-imported modules, preserve the canonical module URL from the manifest (do not rewrite to host paths) when calling `registerServerReference`.
2) **react-server-dom-webpack plugin**: ensure manifest generation includes MF-imported actions (buildInfo flags already set; just respect provided module URLs).
3) **No build-time manifest merge** in the host; everything discovered at runtime via MF data.

## Workstream D – Tests
1) Unit: assert runtime plugin fetches extraData URLs, registers actions, and populates `getServerAction` without HTTP.
2) Integration (node --test): start host only, stop remote HTTP server, verify remote actions still execute (pure MF). Then start remote server to confirm HTTP fallback still works when MF load fails.
3) E2E: browser flows unchanged; add a case where host uses MF-native action and HTTP server is down.

## Rollout Steps
1) Update remote MF config to emit extraData URLs over HTTP.
2) Update rscRuntimePlugin to prefer extraData, cache by manifest URL, and use loadShare for layer-aware React sharing.
3) Ensure host server-entry imports remote server-actions (or lazy load before first action).
4) Remove any residual build-time merges; rely solely on runtime discovery.
5) Add tests (unit + integration + e2e) for MF-native path and fallback behavior.

## Open Questions
- MF runtime “factory is not a function” on Node: diagnose container format vs runtime plugin; may need `@module-federation/node` runtimePlugin ordering or `library.type: 'commonjs-module'` alignment.
- Should remote also publish RSC client manifest URL for host-side SSR of remote client components? If yes, extend runtime plugin to fetch/merge client manifests for SSR worker.
