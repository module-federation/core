---
"@module-federation/enhanced": minor
---

feat(enhanced): add request pattern filtering support for shared modules

- Add request filtering to ConsumeSharedPlugin for direct matches and resolved consumes
- Add request filtering to ProvideSharedPlugin for direct matches
- Support include/exclude.request filtering with string and RegExp patterns
- Add comprehensive unit tests for request filtering functionality
- Add integration tests for provide-filters with request pattern scenarios

This enables filtering shared modules based on request patterns:
```javascript
shared: {
  "./request-filter/": {
    include: { request: /components/ }
  }
}
```