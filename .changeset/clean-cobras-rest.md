---
"@module-federation/runtime-core": patch
"@module-federation/enhanced": patch
"@module-federation/rspack": patch
"@module-federation/sdk": patch
---

Add import map remote entry support in runtime-core with a tree-shakeable
`FEDERATION_OPTIMIZE_NO_IMPORTMAP` flag, and expose `disableImportMap`
in Module Federation plugin optimization options (defaulting to `true`
in build plugins).

Shared modules now honor the `import` field to load shared dependencies
via dynamic import (including bare specifiers resolved by import maps).
