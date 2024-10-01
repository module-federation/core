---
"@module-federation/runtime": patch
---

Refactored the script loading mechanism to use a more generalized loaderHook.

- Replaced `createScriptHook` with `loaderHook` across various functions.
  - Updated `loadEntryScript` function to use `loaderHook.lifecycle.createScript`.
  - Modified `loadEntryDom` function to accept `loaderHook` instead of `createScriptHook`.
  - Adjusted `loadEntryNode` function to handle `loaderHook.lifecycle.createScript`.
- Streamlined the handling of script loading in `getRemoteEntry`.