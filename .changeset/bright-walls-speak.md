---
'@module-federation/enhanced': patch
---

Restore BUILD-001 logging and diagnostic context when an expose cannot resolve. Webpack still reports the build error, and `container.get()` rejects the missing expose.
