# Repository Guidelines

## Project Structure & Modules
- Monorepo managed by `pnpm`. Demo apps live in `apps/rsc-demo/packages/app1` and `apps/rsc-demo/packages/app2`.
- Shared demo app utilities: `apps/rsc-demo/packages/app-shared` (`@rsc-demo/app-shared`).
  - Build-time webpack helpers: `apps/rsc-demo/packages/app-shared/webpack`
  - MF runtime plugins: `apps/rsc-demo/packages/app-shared/runtime`
- Shared demo RSC module: `packages/rsc-demo-shared` (`@rsc-demo/shared`).
- Shared RSC tooling is applied to npm `react-server-dom-webpack@19.2.0` via `patches/react-server-dom-webpack@19.2.0.patch`.
- App source: `apps/rsc-demo/packages/*/src`. Servers: `apps/rsc-demo/packages/*/server`. Webpack configs and build scripts: `apps/rsc-demo/packages/*/scripts`.
- Tests: unit/integration in `apps/rsc-demo/packages/e2e/rsc`, Playwright E2E in `apps/rsc-demo/packages/e2e/e2e`. Build output lands in `apps/rsc-demo/packages/*/build` (gitignored).

## Build, Test, Dev Commands
- `pnpm install` — install workspace deps.
- `pnpm start` — run app1 dev server with webpack watch (bundler + server).
- `pnpm --filter app2 start` — same for app2.
- `pnpm run build` — production builds for app1 and app2 (client + server layers).
- `pnpm test` — top-level test entry; runs RSC tests and MF tests after building.
- `pnpm run test:rsc` — RSC unit/integration tests (Node `--test`).
- `pnpm run test:e2e:rsc` — Playwright smoke for the RSC notes apps.
- `pnpm run test:e2e` — all Playwright suites (requires prior build).

## Coding Style & Naming
- JavaScript/React with ES modules; prefer functional components.
- Indent with 2 spaces; keep files ASCII-only unless existing file uses Unicode.
- Client components carry the `'use client'` directive; server actions/components avoid it. Name server action files `*.server.js` when possible.
- Webpack chunk/module ids are kept readable (`chunkIds: 'named', moduleIds: 'named'`).

## Testing Guidelines
- Frameworks: Node’s built-in `node --test`, Playwright for E2E.
- Place unit/integration specs under `packages/e2e/rsc`. Name with `.test.js`.
- E2E specs live in `packages/e2e/e2e`; keep them idempotent and avoid relying on pre-existing data.
- Run `pnpm run build` before E2E to ensure assets exist.

## Commit & PR Expectations
- Use concise, descriptive commit messages (e.g., `fix: inline action manifest ids`).
- For PRs, include: summary of changes, testing performed (`pnpm test:rsc`, `pnpm test:e2e:rsc`), and any follow-up risks or TODOs.

## Module Federation Configuration
- ALL Module Federation plugins MUST include `experiments: { asyncStartup: true }` in their configuration (both client and server).
- ALL shared modules MUST use `eager: false` - no exceptions. The federation runtime handles async loading.
- Server-side code using asyncStartup bundles must `await` the module loads since module init is async.
- Use separate share scopes for different layers: `'client'` for browser bundles, `'rsc'` for RSC server bundles.
- Shared modules must also specify `layer` and `issuerLayer` matching the webpack layer they belong to (e.g., `client`, `rsc`, `ssr`).

## Security & Config Tips
- Do not check `packages/*/build` or credentials into git; `.gitignore` already covers build artifacts.
- If enabling Postgres locally, gate with `USE_POSTGRES` and ensure fallback to the mock DB for offline runs.
