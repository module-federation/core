---
'@module-federation/sdk': patch
---

Link Node ESM remote entry graphs from the root module only and let `vm` link the rest, so a module reached by two sibling paths links when it has imports of its own, and cyclic graphs link and evaluate the way native Node ESM does instead of failing with an unlinked-module error.
