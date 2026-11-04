---
'@module-federation/bridge-vue3': patch
---

Fix Vue bridge lifecycle state so destroyed roots can be mounted again, avoid
sharing root state between provider instances, cancel asynchronous renders when
their host is destroyed, and allow `appOptions` to be omitted as documented.
