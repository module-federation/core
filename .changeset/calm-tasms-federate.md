---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Avoid logical assignment syntax and use a standards-safe own-property check in
embedded federation runtime initializers so ES2019 and Lynx TASM consumers can
parse the generated runtime.
