---
"@module-federation/sdk": patch
---

Fix issue where `createLink` incorrectly created duplicate links when existing links lacked a `rel` attribute.

- Added a test case to verify `createLink` does not duplicate links when existing ones have no `rel`.
- Modified `createLink` logic to treat `null` and `undefined` as equivalent for `rel` attribute.
- Ensures consistent behavior even when `rel` attribute is missing.
