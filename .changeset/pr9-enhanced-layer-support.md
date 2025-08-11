---
"@module-federation/enhanced": patch
---

test: add test coverage for ConsumeSharedPlugin and ProvideSharedPlugin

- Add 70+ tests for ConsumeSharedPlugin covering all critical business logic including multi-stage module resolution, import resolution logic, version filtering, and error handling
- Add 73 tests for ProvideSharedPlugin covering shouldProvideSharedModule method, provideSharedModule method, module matching, and resolution stages
- Fix minor bug in ProvideSharedPlugin where originalRequestString was used instead of modulePathAfterNodeModules for prefix matching
- Add layer property to resolved provide map entries for better layer support
- Improve test infrastructure stability and CI reliability with better assertions and mocking