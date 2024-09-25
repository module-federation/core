---
"@module-federation/data-prefetch": patch
---

Refactored the way prefetch entries are imported for improved dynamic loading handling.

- Changed the import of prefetch entries to use a function wrapper for more dynamic control.
- Updated data types to ensure consistency with the new function-based import approach.
- Modified the `injectPrefetch` function structure to incorporate the new import method.
- Modified the `MFDataPrefetch` class to handle the new import function when resolving exports.