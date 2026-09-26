---
'@module-federation/enhanced': patch
---

Fix shared `requiredVersion` auto-detection for package-manager protocol specifiers (`catalog:`, `workspace:*`, `npm:`, etc.) by resolving the configured package and using its installed version as a caret range.
