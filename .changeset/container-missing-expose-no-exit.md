---
'@module-federation/enhanced': patch
---

An exposed module that fails to resolve no longer exits the Node process during code generation. The build finishes with webpack's "Module not found" error in `compilation.errors`, and the container's `get()` for that expose throws `MODULE_NOT_FOUND`, as in upstream webpack. Watch mode and dev servers keep running.
