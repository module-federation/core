---
"@module-federation/enhanced": patch
---

test: add comprehensive test coverage for ProvideSharedPlugin

- Add 73 comprehensive tests covering all critical business logic and edge cases
- Implement complete shouldProvideSharedModule method coverage (15 tests) for version filtering with semver validation
- Add provideSharedModule method tests (16 tests) covering version resolution, request pattern filtering, and warning generation
- Implement module matching and resolution stage tests (20 tests) for multi-stage resolution logic
- Validate business rules: warnings only for version filters with singleton, not request filters
- Cover all critical private methods with proper TypeScript handling using @ts-ignore
- Fix container utils mock for dependency factory operations
- Add performance and memory usage tests for large-scale scenarios

This ensures comprehensive test coverage for ProvideSharedPlugin's complex module sharing logic and prevents regressions.