---
'@module-federation/enhanced': patch
---

Keep one consume-shared module per `requiredVersion` range. Two packages that
require different ranges of the same shared dependency no longer collapse into
one module, so each gets its own version check.
