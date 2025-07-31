---
"@module-federation/node": patch
"@module-federation/sdk": patch
---

fix: prevent infinite recursion in Node.js module imports

- Add `nodeRuntimeImportCache` in node runtime plugin to prevent recursive imports
- Add `sdkImportCache` in SDK node module to prevent recursive imports  
- Cache promises to prevent infinite loops during circular dependencies
- Clear cache on errors to allow retry attempts
- Add comprehensive test coverage for recursion scenarios

This fixes "Maximum call stack size exceeded" errors that can occur when there are circular dependencies in module loading.