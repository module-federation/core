---
'@module-federation/core': patch
'@module-federation/enhanced': patch
'@module-federation/node': patch
'@module-federation/nextjs-mf': patch
---

Migrate the `@nx/js:tsc` packages (`core`, `enhanced`, `node`, `nextjs-mf`) to `rslib build`, remove the legacy nextjs-mf rename flow, and preserve dist export contracts.
