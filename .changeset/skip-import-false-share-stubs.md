---
'@module-federation/runtime-core': patch
---

Skip consume-only `import: false` share-scope stubs when selecting a provider if a real shared module exists for the package.
