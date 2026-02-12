---
'@module-federation/rsbuild-plugin': patch
---

Fix app-mode `target: 'node'` handling to respect custom `environment` names, improve missing-environment errors, and ensure selected node-target environments still receive federation plugin injection for commonjs-like SSR outputs.
