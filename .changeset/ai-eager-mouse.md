"@module-federation/sdk": patch
---

Fixes an issue where duplicate links were created when existing links had no rel attribute.

- Added a test in `dom.spec.ts` to ensure links without `rel` attribute aren't duplicated.
- Modified the `createLink` function in `dom.ts` to treat `null` and `undefined` `rel` attributes as equivalent when checking for existing links.
```