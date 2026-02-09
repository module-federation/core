---
"@module-federation/esbuild": minor
---

Completely redesigned and rebuilt the esbuild plugin from the ground up for full Module Federation support.

**Breaking changes:**
- Requires `format: 'esm'` and `splitting: true` (auto-set if not configured)
- Requires `@module-federation/runtime` as a peer dependency
- Remote module imports now use default export pattern (see README for migration)

**New features:**
- Shared modules via `loadShare()` with version negotiation and fallback chunks
- Remote modules via `loadRemote()` with name@url parsing (http + https)
- Container entry (remoteEntry.js) with standard `get()`/`init()` protocol
- Runtime initialization with top-level await for proper async boundaries
- Eager shared module support (static imports instead of dynamic)
- `shareScope` configuration (global and per-module/per-remote overrides)
- `shareStrategy` configuration (`version-first` or `loaded-first`)
- `runtimePlugins` injection into the MF runtime
- `publicPath` configuration for manifest and asset resolution
- `import: false` to disable local fallback for shared modules
- `shareKey` for custom keys in the share scope
- `packageName` for explicit version auto-detection
- Re-export following in export analysis (resolves `export * from`)
- Manifest generation (mf-manifest.json) with full asset metadata
- Subpath import handling for shared packages (e.g., `react/jsx-runtime`)
- 117 tests covering all features
