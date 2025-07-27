---
'@module-federation/enhanced': minor
---

fix(enhanced): add module factory for EntryDependency when entry is empty

- bind normalModuleFactory for EntryDependency when no moduleFactory is bound for EntryDependency
