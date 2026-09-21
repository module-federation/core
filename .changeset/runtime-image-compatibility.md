---
'@module-federation/enhanced': minor
'@module-federation/runtime': minor
'@module-federation/runtime-core': minor
'@module-federation/inject-external-runtime-core-plugin': patch
---

Store runtime-image metadata on runtime instances and on the global
external-core state. A known mismatch of family, target, capability, or entry
loader fails before the runtime reuses shared state or a cached remote entry.

The remote-entry cache key does not change.
