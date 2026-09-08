---
"@module-federation/dts-plugin": patch
---

Stop passing `overwrite: true` to adm-zip's `extractAllTo` when the types folder was just deleted (the default `deleteTypesFolder: true` path). Every entry is new there, so overwrite was redundant, and disabling it removes the precondition for CVE-2026-76845 (symlink following on extraction). Overwrite stays on when `deleteTypesFolder` is false or the deletion failed, so existing behaviour is unchanged in those paths.
