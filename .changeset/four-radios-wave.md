---
'@module-federation/core': patch
'@module-federation/enhanced': patch
'@module-federation/node': patch
'@module-federation/nextjs-mf': patch
---

Migrate package builds from `@nx/js:tsc`/legacy steps to `rslib build` for `core`, `enhanced`, `node`, and `nextjs-mf`, including updated project build targets and rslib configuration to preserve dist output contracts.
