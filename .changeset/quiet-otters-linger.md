---
'@module-federation/sdk': patch
---

Wait for a concurrently-linking ESM module before handing it to a second importer, so a remote entry graph that reaches one module by two sibling paths links when that module has imports of its own. Cyclic graphs still receive the in-progress instance rather than deadlocking.
