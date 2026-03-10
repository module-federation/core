---
"@module-federation/esbuild": patch
---

fix: fix import map registration for ESM remote modules

The import map registration was failing because the runtimePlugin was looking for moduleMap in the host scope instead of fetching it from the remote module exports. This fix adds explicit synchronous import map registration in the host initialization code that runs after initializeSharing but before any code that imports from remotes.
