---
"@module-federation/enhanced": patch
---

Added a check to skip processing when virtualRuntimeEntry is present.

- Added an early return in `FederationRuntimePlugin` to skip processing if `options.virtualRuntimeEntry` is defined.