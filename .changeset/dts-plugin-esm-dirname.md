---
'@module-federation/dts-plugin': patch
---

Fix `__dirname is not defined` ReferenceError when `@module-federation/dts-plugin` is consumed as ESM. `DevWorker`, `DevPlugin`, and `createBroker` now derive `__dirname` from `import.meta.url` (matching the existing `DtsWorker` shim) so the ESM build no longer emits bare `__dirname`.
