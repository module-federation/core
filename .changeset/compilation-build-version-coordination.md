---
'@module-federation/manifest': patch
'@module-federation/enhanced': patch
'@module-federation/rspack': minor
'@module-federation/rsbuild-plugin': patch
'@module-federation/sdk': patch
---

Coordinate compilation-scoped `buildVersion` across browser and Node builds (including Rslib dual-target watch rebuilds) and emit document-local `mf:hmr-check` hints in development from `@module-federation/rspack` without requiring a DTS broker.
