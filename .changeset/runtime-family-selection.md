---
'@module-federation/managers': minor
---

Add the runtime-family contract parser, the edge-by-edge family resolver, and
the compiler selection state under `@module-federation/managers/runtime-selection`.
The resolver rejects a missing or mismatched family member instead of using a
member from another installation.
