---
'@module-federation/bridge-vue3': patch
---

Fix Vue bridge lifecycle state so destroyed roots can be mounted again, avoid
sharing root state between provider instances, and allow `appOptions` to be
omitted as documented.
