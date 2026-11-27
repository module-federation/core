---
'@module-federation/metro': patch
---

fix(metro): rewrite only the path of dev server URLs. An entry whose name is also part of the server's host, such as a remote named `host` served from `localhost`, no longer breaks HMR registration and symbolication.
