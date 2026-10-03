---
'@module-federation/runtime-core': patch
---

Scope evaluated remote entry caches to the composed platform and entry loading callbacks so hosts using different evaluators cannot receive one another's containers.
