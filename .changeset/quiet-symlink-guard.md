---
"@module-federation/dts-plugin": patch
---

Stop passing `overwrite: true` to adm-zip's `extractAllTo` when `deleteTypesFolder` is enabled (the default). The folder is removed immediately before extraction, so overwrite was redundant there, and disabling it removes the precondition for CVE-2026-76845 (symlink following on extraction) on the default path.
