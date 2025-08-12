---
"@module-federation/node": patch
"@module-federation/sdk": patch
---

fix(node): prevent infinite recursion in module imports

- Add import cache to prevent infinite recursion when modules have circular dependencies
- Cache import promises to ensure each module is only imported once
- Clear cache on import errors to allow retry attempts
- Add test coverage for recursion scenarios