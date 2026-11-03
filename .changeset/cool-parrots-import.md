---
'@module-federation/node': minor
---

Add an opt-in native HTTP(S) ESM loader for Node.js hosts. Importing `@module-federation/node/register` (e.g. `node --import @module-federation/node/register app.mjs`) registers Node module customization hooks (`module.register()`) that import ESM remote entries and their chunks directly over HTTP with a per-origin allowlist derived from registered remotes, letting the Module Federation runtime load `library.type: 'module'` remotes in a plain Node process without a bundler runtime. The default vm-based loading path is unchanged; the native path only activates for registered processes and can be disabled with `MF_NODE_NATIVE_LOADER=0`. A programmatic API is available via `@module-federation/node/loader-hooks` (`registerNativeHttpLoader`).
