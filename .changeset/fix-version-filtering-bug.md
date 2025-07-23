---
"@module-federation/enhanced": patch
---

fix version filtering to read actual module versions from package.json

- Fixed critical bug where version filtering incorrectly compared version ranges instead of actual module versions
- Now correctly reads actual module versions from package.json files using `getDescriptionFile()` and `path.dirname()`
- Version include/exclude filters now work as expected (e.g., "^1.2.0" correctly satisfies "^1.0.0" when module version is "1.2.3")
- Enhanced test coverage with comprehensive config test cases using real node_modules structure
- Added proper version filtering test scenarios with actual package.json files containing specific versions