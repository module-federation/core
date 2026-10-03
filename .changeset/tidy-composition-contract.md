---
'@module-federation/enhanced': patch
---

Reject incompatible runtime families and optimization targets across enhanced copies sharing a compiler composition plan. Validate the shared composition protocol before using another copy's slot. Preserve opted-out full-runtime builds across older copies, and use the full runtime when current-protocol participants mix composed-runtime opt-in and opt-out settings.
