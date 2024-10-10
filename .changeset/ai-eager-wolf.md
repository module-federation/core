---
"@module-federation/node": patch
---

Add global flag `moduleGraphDirty` to control forced revalidation in hot-reload.

- Introduced new global variable `moduleGraphDirty`.
  - Initialized `moduleGraphDirty` to `false` in the global scope.
- Modified `revalidate` function to check `moduleGraphDirty` flag.
  - Forces revalidation if `moduleGraphDirty` is `true`.