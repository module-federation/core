---
"@module-federation/node": minor
---

Enhanced hot-reload functionality with module decaching and improved type safety.

- Added `callsite` package for resolving module paths.
- Implemented `decache` and `searchCache` functions to remove modules from cache safely.
  - Ensure proper handling of relative module paths.
  - Avoid issues with native modules during decaching.
- Refactored hot-reload logic to use the new decache functionality.
- Improved type definitions and type safety throughout `hot-reload.ts`.
  - Properly typed function return values.
  - Added TypeScript annotations for better clarity.