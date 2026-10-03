---
'@module-federation/runtime-core': patch
---

Prevent default Node entry loads from borrowing process-global exports left by a custom evaluator. Contextual loads use their scoped cache and validated SDK result while direct legacy platform calls retain global reuse.
