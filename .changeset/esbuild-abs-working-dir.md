---
'@module-federation/esbuild': patch
---

Resolve the remote entry, the `mf-manifest.json` output path, and the manifest's shared package versions from esbuild's `absWorkingDir` instead of `process.cwd()`.
