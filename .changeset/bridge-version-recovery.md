---
'@module-federation/bridge-react': patch
---

Preserve typed Service version mismatches through browser receive sessions and
Host error frames. Keep these mismatches outside generic CSR recovery, which
cannot fix an old Service version selection, while retaining ordinary error
recovery and sanitized server diagnostics.
