---
"@module-federation/nextjs-mf": patch
---
- Added `globalThis.moduleGraphDirty = true` to mark the module graph as dirty when an error is detected.
- Replaced `new Function('return globalThis')()` with a direct reference to `globalThis`.
