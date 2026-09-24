---
'@module-federation/managers': minor
---

Add `@module-federation/managers/runtime-selection`. It reads the optional
`federationRuntime` contract from a runtime-tools package, walks each family
dependency from the package that requires it, and returns one root per member
role. A missing or mismatched member is an error. The resolver does not fill
the gap from another installed copy. Packages without the contract keep the
current `FEDERATION_*` define behavior. Within one plugin an explicit
`disableRemote` or `disableShared` flag wins over configured `remotes` or
`shared`, as on main today.
