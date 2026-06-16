---
'@module-federation/runtime-core': minor
'@module-federation/sdk': minor
---

Add per-remote `fetchOptions` to `registerRemotes`, enabling header-authenticated ESM remote loading. When a `module`/`esm` remote is registered with `registerRemotes(remotes, { fetchOptions })`, the manifest, remote entry, split chunks, and shared deps are loaded via a fetch + blob import-rewriting loader so custom HTTP headers (e.g. `Authorization`) reach every asset request. Manifest-declared CSS for such remotes is also fetched with headers and injected as a blob stylesheet. Non-ESM remotes and remotes without `fetchOptions` are unaffected.
