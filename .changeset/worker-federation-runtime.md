---
'@module-federation/enhanced': patch
---

Workers created with `new Worker(new URL(...))` and other async entrypoints now get the federation runtime entry in their own runtime chunk, so a remote or shared module loaded from a worker no longer throws on `bundlerRuntime`. Modules hoisted into runtime chunks are only removed from other chunks when every runtime of that chunk received them.
