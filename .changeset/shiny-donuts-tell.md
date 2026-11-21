---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

fix default requiredVersion when a shared module has no version, it was the string "^undefined" which never matches anything, now it falls back to "*"
