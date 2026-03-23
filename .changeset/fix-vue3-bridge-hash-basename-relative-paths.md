---
'@module-federation/bridge-vue3': patch
---

fix(bridge-vue3): skip rewriting relative paths, query strings, and hash fragments in hash+basename mode

The `patchRouter` function created by `createHashBasenamePatch()` now only rewrites
**absolute** paths (starting with `/`). Previously it blindly prefixed any string
navigation, which caused:

- Relative paths like `router.push('settings')` to become `/barbersettings` instead of
  being resolved by Vue Router against the current route.
- Query-only navigations like `router.push('?tab=details')` to jump to `/barber?tab=details`,
  dropping the current path.
- Hash-only navigations like `router.push('#anchor')` to jump to `/barber#anchor`.
