---
'@module-federation/enhanced': minor
'@module-federation/rspack': minor
'@module-federation/runtime-tools': minor
---

Coordinate runtime-family selection once per compiler. Enhanced and Rspack now
aggregate capability requirements before they apply compatibility defines.
Custom runtime implementations fail when their family is incomplete.

Add the default-only runtime facade. Rspack keeps its legacy bootstrap until
the native plugin reports support for the facade contract.
