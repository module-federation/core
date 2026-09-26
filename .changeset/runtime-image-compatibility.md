---
'@module-federation/enhanced': minor
'@module-federation/runtime': minor
'@module-federation/runtime-core': minor
'@module-federation/inject-external-runtime-core-plugin': patch
---

Carry runtime-image metadata on runtime instances, the external runtime-core
provider, and remote-entry cache entries. When both sides carry metadata, a
known family, target, capability, or entry-loader mismatch fails before the
instance runs plugins, before the external core is reused, and before a cached
remote entry is reused.

Every check is inert without metadata. Builds that do not use
`module-federation:*` conditions keep today's behavior, and the remote-entry
cache key stays `name` plus `entry`.
