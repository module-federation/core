---
'@module-federation/bridge-react': patch
'@module-federation/runtime-core': patch
---

Resolve Service App HTTP endpoints from the selected Snapshot's deployment base and expose path. Keep Host service maps optional and limited to request policy, and use one same-origin browser ingress prefix. Preserve Service provenance across deployment changes and diagnose incompatible version-first shared discovery without requiring a configured policy.
