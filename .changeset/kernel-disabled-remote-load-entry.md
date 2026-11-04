---
'@module-federation/runtime-core': patch
---

Keep the `loadEntry` hook on the disabled remote handler, so a kernel or root without remotes can still load shared tree-shaking fallback entries.
