---
'@module-federation/metro': patch
---

fix(metro): load an eager shared module synchronously when it is required before its async load finishes. A host entry that imports a shared package other than `react` or `react-native` no longer gets an empty object at startup.
