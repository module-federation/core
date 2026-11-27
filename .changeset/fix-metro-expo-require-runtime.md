---
'@module-federation/metro': patch
---

fix(metro): prefix the require globals in Expo CLI's require runtime. A host or remote served by Expo CLI no longer fails with "Property '<name>__r' doesn't exist".
