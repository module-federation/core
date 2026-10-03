---
'@module-federation/runtime-core': patch
---

Scope evaluated remote entry caches to the composed platform and entry loading callbacks so hosts using different evaluators cannot receive one another's containers.

Use each Node entry load's validated exports, apply Node entry URL transforms, and reject browser IIFE loads that would share a physical global name across different custom evaluators.
