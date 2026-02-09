---
"@module-federation/runtime-core": patch
---

Fix a race where concurrent `Module.init()` calls could run remote container initialization more than once.

`Module.init()` now deduplicates in-flight initialization with a shared promise so `beforeInitContainer`/`initContainer` logic executes once per module while preserving stable initialized state after completion.

Also adds regression coverage for concurrent initialization behavior.
