---
"@module-federation/runtime": patch
---

Replaced dynamic module import using `new Function` with a safer direct `import` call.

- Removed usage of `new Function` to execute dynamic import
- Implemented a direct async import with `/* webpackIgnore: true */` for proper bundler handling
