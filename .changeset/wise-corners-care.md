---
'@module-federation/runtime-core': patch
---

Clear rejected remote-entry loading promises from `globalLoading` so a later independent request can start a fresh load.
