---
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/error-codes': patch
---

feat(webpack-bundler-runtime): add RUNTIME-012 error for invalid shared module getter

When `loadShare` returns `false` and the local `getter` is not a function (e.g. `undefined`), throw a `RUNTIME-012` error with the affected `shareKey`. This typically happens when `shared.import: false` is set but no host provides the corresponding `lib`.
