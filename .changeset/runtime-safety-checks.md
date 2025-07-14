---
"@module-federation/enhanced": patch
---

fix(enhanced): add runtime safety checks to prevent errors

- Add typeof check for prevStartup function in EmbedFederationRuntimeModule to prevent calling undefined function
- Add typeof check for __webpack_require__.x in StartupHelpers to prevent calling undefined function
- Add warning logs when these functions are missing to help developers debug issues

These defensive checks improve stability and prevent edge case failures in certain build configurations.