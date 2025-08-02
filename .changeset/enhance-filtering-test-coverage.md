---
"@module-federation/enhanced": patch
---

test: add comprehensive test coverage for request pattern filtering

- Add integration tests for request pattern filtering in provide-filters test case
- Add test cases verifying modules match/don't match request include filters
- Add unit tests for `extractPathAfterNodeModules` utility function
- Add unit tests for `createLookupKeyForSharing` utility function
- Add test files for request filtering scenarios (components/Button.js, utils/helper.js, etc.)

This enhances test coverage to ensure request pattern filtering functionality works correctly and prevents regressions.