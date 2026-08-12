---
'@module-federation/bridge-react': minor
---

feat(bridge-react): built-in HMR runtime with `rootComponentGetter` option

- Added an optional `rootComponentGetter?: () => ComponentType<T>` field to `ProviderFnParams<T>` (documented via JSDoc in `types.ts`). When supplied, the bridge re-reads the latest root component reference on every HMR cycle through `require.cache` runtime module replacement, bypassing the stale closure capture in `createBridgeComponent`.
- The package now ships a built-in HMR runtime (`src/provider/versions/hmr-runtime.ts`) that:
  - Keeps a per-caller global registry of the latest root component / getter (resolved via `Error().stack` frame fingerprinting).
  - Tracks every mounted bridge render handle (`root`, `dom`, `bridgeInfo`) so it can trigger Fiber reconciliation on demand.
  - Installs dual accept paths on Rspack hot updates — monkey-patching the global `window.rspackHotUpdate{host,remote}` shims AND attempting `import.meta.webpackHot.accept` when available via a runtime `new Function('return import.meta')()` escape.
- Result: editing App or descendant components inside a federated Remote updates the DOM text within 4–8 s without a full page reload, and any React state owned by the Host side of the bridge is preserved 100%.
- Added `docs/hmr-internals.md` design note covering the four-step internal mechanism, a working Babel-plugin proof-of-concept for zero-boilerplate `rootComponentGetter` injection at compile time, the Modern.js / Rspack loader integration snippet, and the follow-up work checklist (Rust swc_core plugin, `bridge-react-webpack-plugin` shim, meta-package).
- Updated the package README with user-facing getter patterns (default / named / tsconfig alias) and links into `docs/hmr-internals.md`.
