# Shared Treeshaking Demos

Two Module Federation demo apps that showcase tree‑shaking for shared dependencies:

- `apps/shared-tree-shaking/no-server`: no external snapshot service; uses the `runtime-infer` mode to detect used exports.
- `apps/shared-tree-shaking/with-server`: integrates “re‑shake” build artifacts (snapshots) and uses the `server-calc` mode to prune shared packages precisely.

## Project Layout

- `no-server/host` – consumer (Host)
- `no-server/provider` – producer (Provider)
- `with-server/host` – consumer (with re‑shake flow)
- `with-server/provider` – producer

Example dependencies: `antd@6.0.1`, `react@18.3.x`.

## Quick Start (no‑server)

1. Install dependencies (at repo root)

- `pnpm i`

2. Build and serve the Provider (start the remote first)

- Build: `nx run shared-tree-shaking-no-server-provider:build`
- Serve: `nx run shared-tree-shaking-no-server-provider:serve`
  - Default: `http://localhost:3002/`

3. Build and serve the Host (local dev)

- Build: `nx run shared-tree-shaking-no-server-host:build`
- Serve: `nx run shared-tree-shaking-no-server-host:serve`
  - Default: `http://localhost:3001/`

4. Verify the page and the shared dependency

- Visit `http://localhost:3001/`; the Remote and Consumer content should render.
- In the browser console, inspect the shared module:
  - `__FEDERATION__.__SHARE__[hostId].default['antd'][version].lib()`
  - Sample keys (based on your build): `hostId = 'mf_host:0.1.34'`, `version = '6.0.1'`.
- With the `runtime-infer` mode, `lib()` initially returns a pruned component set (e.g., `Button/Divider/Space/Switch`).

5. Simulate a “full fallback” (no tree shaking)

- In the console: `localStorage.setItem('calc', 'no-use')`
- Refresh the page and call `lib()` again; it should return the full component list (no pruning).

## Advanced Flow (with‑server)

> `nx run shared-tree-shaking-with-server-host:serve:all` to start all servers (Host, Provider, re‑shake static server).

This flow produces “re‑shake” artifacts and serves them via a URL. The Host loads the snapshot and prunes shared packages using the `server` mode.

1. Produce re‑shake artifacts for the Host

- `nx run shared-tree-shaking-with-server-host:build-re-shake`

2. Serve the re‑shake directory

- `nx run shared-tree-shaking-with-server-host:serve-re-shake`
- Default: `http://localhost:3003/`, e.g., `/independent-packages/antd/xxx.js`

3. Configure the snapshot entry in the Host

- Open `apps/shared-tree-shaking/with-server/host/runtimePlugin.ts`
- Set `secondarySharedTreeShakingEntry` to the URL above, e.g.:
  - `http://localhost:3003/independent-packages/antd/antd_mf_host.<hash>.js`

4. Build and serve the Provider

- Build (trigger tree‑shaking): `nx run shared-tree-shaking-with-server-provider:build`
- Serve: `nx run shared-tree-shaking-with-server-provider:serve` (default `3002`)

5. Build and serve the Host

- `nx run shared-tree-shaking-with-server-host:build` (default `3001`)
- Serve: `nx run shared-tree-shaking-with-server-host:serve` (default `3001`)

6. Check the loaded lib

- Refresh the page and check `lib()`; it should return a much smaller export subset (e.g., only 4–5 components).

## Cypress E2E (no‑server Host)

- Run from the Host root:
  - `nx run shared-tree-shaking-no-server-host:test:e2e`

## Cypress E2E (with-server Host)

- Run from the Host root:
  - `nx run shared-tree-shaking-with-server-host:test:e2e`

## FAQ

- Ports: Provider `3002`, Host `3001`, re‑shake static server `3003`.
- Keys and versions: `__FEDERATION__.__SHARE__` keys contain `:` or `-`; use bracket notation (e.g., `['mf_host:0.1.34']`, `['ui-lib']`).
- Console example:
  - `__FEDERATION__.__SHARE__['mf_host:0.1.34'].default['antd']['6.0.1'].lib()`
- If you use Nx, you can also run `nx build/serve` for the projects; commands must match actual project names.
