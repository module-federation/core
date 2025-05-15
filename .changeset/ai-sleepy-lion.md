---
"@module-federation/runtime-core": patch
---

Add conditional functionality for snapshots and optimize entry loading.

- Introduced FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN constant to control snapshot functionality.
  - Default to include snapshot functionality if constant is not defined.
- Simplified plugin loading logic to check USE_SNAPSHOT flag.
- Added ENV_TARGET constant to differentiate between web and node environments.
- Extracted duplicated logic for handling remote entry loaded into `handleRemoteEntryLoaded` function.
- Refactored entry loading to use conditional environment checks with `ENV_TARGET`.
