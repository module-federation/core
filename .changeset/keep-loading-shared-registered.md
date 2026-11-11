---
'@module-federation/runtime-core': patch
---

fix(runtime-core): keep a shared module that is loading registered, so that a container registering the same version later does not give consumers a second instance of a singleton; a module that fails to load can still be replaced or loaded again
