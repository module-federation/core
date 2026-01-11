---
'@module-federation/enhanced': patch
---

Fix ESM default export handling for .mjs files by overriding getExportsType() in ConsumeSharedModule and RemoteModule to return "dynamic"
