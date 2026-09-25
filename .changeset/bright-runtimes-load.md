---
'@module-federation/runtime': patch
'@module-federation/runtime-core': patch
---

`createInstance` now constructs the runtime's own `ModuleFederation` class, not a debug constructor that another bundle set on the global. `init` reuses a global instance only when it supports the same remote loading, shared loading, snapshot plugins, and build target as the calling runtime. Updated runtimes do not reuse instances created by older runtimes.
