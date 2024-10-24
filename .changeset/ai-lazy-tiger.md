---
"@module-federation/node": patch
---

Improved error handling and cache clearing process in hot-reload utility.

- Added error handling with try-catch block to manage potential exceptions when clearing the path cache.
- Replaced direct use of module with a reference to currentChunk for cache path operations.
- Ensured compatibility with TypeScript by adding @ts-ignore annotations where necessary.
```