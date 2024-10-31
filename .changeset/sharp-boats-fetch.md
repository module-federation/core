---
'@module-federation/runtime': minor
---

Refactored Federation module to enhance initialization and runtime operations.

- Introduced `FederationManager` class to encapsulate Federation Instance operations.
  - Added `bundlerId` support for constructor methods.
  - Ensured singleton pattern for `FederationManager`.
- Introduced a `ShareableRuntime` type and `__SHAREABLE_RUNTIME__` object for global sharing of runtime exports.
- Replaced `createScriptHook` with `loaderHook` for `loadEntryScript`, `loadEntryDom`, and `loadEntryNode` functions.

