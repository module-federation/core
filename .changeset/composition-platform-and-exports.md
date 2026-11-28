---
'@module-federation/managers': patch
---

Keep the selected platform in shared-only runtime compositions so shared fallback entries can load with remotes disabled. Validate composition exports with the same import conditions used by the bootstrap, and fall back when required exports are disabled, inaccessible under those conditions, or point to missing files.
