---
'@module-federation/enhanced': patch
---

Test `include.request` and `exclude.request` on provided shared modules only against the import request, never against the resolved file path. A prefix such as `'lodash/'` with `include: { request: 'get' }` and a direct entry such as `react` with `include: { request: 'react' }` now provide their modules, and an `exclude.request` pattern no longer drops modules whose absolute path happens to match it.
