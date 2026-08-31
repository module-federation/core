---
'@module-federation/enhanced': patch
---

Fix shared `requiredVersion` auto-detection for package-manager protocol specifiers (`catalog:`, `workspace:*`, `npm:`, etc.) by falling back to the installed package version as a caret range.
