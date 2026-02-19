---
'@module-federation/metro': patch
---

refactor and harden Metro module federation config handling by deduplicating normalized runtime plugins, tightening option validation, and improving warnings for unsupported/deprecated options, including deprecating `plugins` in favor of `runtimePlugins`.
