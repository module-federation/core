---
'@module-federation/sdk': patch
---

Resolving issue where localstorage is disabled, for cases like android WebView, where it will be null. This wraps localstorage checks in try catch will fallback to see if document is not undefined
