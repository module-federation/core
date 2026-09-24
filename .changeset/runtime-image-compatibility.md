---
'@module-federation/enhanced': minor
'@module-federation/runtime': minor
'@module-federation/runtime-core': minor
'@module-federation/inject-external-runtime-core-plugin': patch
---

Carry runtime-image metadata into runtime instances and global external-core
state. Known incompatible families, targets, capabilities, and entry loaders
now fail before shared state or a cached remote entry is reused.

The remote-entry cache key remains unchanged.
