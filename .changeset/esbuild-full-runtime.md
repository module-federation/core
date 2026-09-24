---
'@module-federation/esbuild': patch
---

Resolve generated remote-entry output, the manifest file, and the host
package.json lookup from esbuild's `absWorkingDir` instead of
`process.cwd()`. Keep the adapter on the full default bundler runtime and
test the public build path without resolver or process-directory overrides.
