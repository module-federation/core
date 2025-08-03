---
"@module-federation/enhanced": patch
---

test: implement comprehensive test coverage for ConsumeSharedPlugin

- Add 70+ comprehensive tests for createConsumeSharedModule method covering all critical business logic
- Implement tests for import resolution logic including error handling and direct fallback regex matching
- Add comprehensive requiredVersion resolution tests for package name extraction and version resolution
- Implement include/exclude version filtering tests with fallback version support
- Add singleton warning generation tests for version filters as specified
- Implement package.json reading error scenarios and edge case handling
- Add apply method tests for plugin registration logic and hook setup
- Achieve test coverage parity with ProvideSharedPlugin (70+ tests each)

This addresses the requirement for "immense test coverage for consume share plugin and provide share plugin to cover all its very complex logic" and ensures comprehensive testing of multi-stage module resolution, layer matching, version filtering, and error handling.