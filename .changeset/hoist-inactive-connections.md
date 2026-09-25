---
'@module-federation/enhanced': patch
---

HoistContainerReferencesPlugin no longer hoists modules that webpack already pruned. The module graph walk now skips connections whose active state is false, such as an unused import of a `sideEffects: false` package, so the runtime chunk keeps only modules that are reachable through an active connection.
