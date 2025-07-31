---
"@module-federation/enhanced": minor
---

feat(enhanced): add include/exclude filtering for shared modules

- Add include/exclude filtering for both ConsumeSharedPlugin and ProvideSharedPlugin
- Support version-based filtering using semantic version ranges (e.g., `include: { version: '^18.0.0' }`)
- Support request pattern filtering with string and RegExp (e.g., `include: { request: /^Button/ }`)
- Add singleton warnings when filters are used to prevent multiple shared instances
- Enhanced type definitions and JSON schema validation for filtering options