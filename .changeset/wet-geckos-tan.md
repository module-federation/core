---
'runtime-remote1': patch
'@module-federation/runtime': patch
'@module-federation/sdk': patch
---

fix: In load remote, link preload is not used to preload resources, preventing resource reloading
