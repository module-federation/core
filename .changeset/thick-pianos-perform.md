---
'@module-federation/runtime': patch
'@module-federation/sdk': patch
---

fix(runtime): Fixed an issue where script failed to load properly when static resources were set to cross-domain response headers due to the default setting of script crossorigin to anonymous (this issue appeared in next.js)

