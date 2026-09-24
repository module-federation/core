---
'@module-federation/esbuild': patch
---

Resolve the generated remote entry and the `mf-manifest.json` output path
from esbuild's `absWorkingDir` instead of `process.cwd()`. Keep the adapter on
the full default bundler runtime and test the public build path without
resolver or process-directory overrides.
