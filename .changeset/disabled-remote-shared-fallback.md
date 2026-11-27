---
'@module-federation/runtime-core': patch
---

Keep the `loadEntry` hook on the disabled remote handler so shared tree-shaking fallback entries load when `experiments.optimization.disableRemote` is enabled.
