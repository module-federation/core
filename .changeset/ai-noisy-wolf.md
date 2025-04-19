---
"@module-federation/cli": patch
---

Improve dynamic module import for `readConfig` function to use file URL format.

- Added `pathToFileURL` import from 'url' module.
- Updated the dynamic import statement for `mfConfig` to use `pathToFileURL(preBundlePath).href`.
- Ensures compatibility and correctness in environments where file paths require URL format.
