---
'@module-federation/esbuild': patch
---

Resolve generated remote-entry output from esbuild's `absWorkingDir`. The
adapter still imports the full default bundler runtime. The test uses the
public build path, with no resolver or process-directory overrides.
