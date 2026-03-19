---
'@module-federation/rstest': patch
---

Add `@module-federation/rstest` as the package-level Rsbuild federation plugin, port the richer federation behavior from rstest core, and resolve the Node runtime plugin from the package's own context so consumers do not need to install `@module-federation/node` directly. This includes remote-name-aware externals bypassing, container-reference request handling, and node-target defaults that inject the resolved runtime plugin automatically.
