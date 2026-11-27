---
'@module-federation/metro': patch
---

fix(metro): keep the federation bundle loader installed under Expo. Expo's own loader no longer replaces it in a host, and a remote that does not bundle `expo` no longer fails its first split bundle with "undefined is not a function".
