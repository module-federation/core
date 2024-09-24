---
"@module-federation/runtime": patch
---

- Refactor `embedded.ts` to use a proxy pattern for better runtime compatibility:
  - Implement FederationHost and Module classes that delegate to the actual runtime implementation
  - Expose all public methods and properties from the original classes
  - Use a lazy initialization approach to ensure proper runtime loading
- Add comprehensive test suite for API synchronization between embedded.ts and index.ts
  - Introduce new test file `sync.spec.ts` with extensive tests for API compatibility
  - Ensure FederationHost and Module classes have the same methods in both files
  - Test various scenarios including remote loading, manifest handling, and circular dependencies
  - Modify `core.ts` to make `formatOptions` method public

