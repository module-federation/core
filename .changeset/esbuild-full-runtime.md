---
'@module-federation/esbuild': patch
---

Resolve generated remote-entry output from esbuild's `absWorkingDir`. Keep the
adapter on the full default bundler runtime and test the public build path
without resolver or process-directory overrides.
