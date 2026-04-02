---
"@module-federation/enhanced": patch
---

Fix garbled version strings in webpack build stats for shared modules by parsing raw semver strings before passing them to rangeToString in ConsumeSharedModule's identifier and readableIdentifier methods.
