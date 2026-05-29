---
'@module-federation/dts-plugin': patch
---

Fix manifest `.json` remotes so zip/api type URLs are resolved correctly instead of being skipped when the remote entry already has a convention-based zip URL.
