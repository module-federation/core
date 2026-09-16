---
'@module-federation/runtime': patch
---

init() no longer re-points the top-level runtime singleton when a later instance is created in the same process, so a remote container sharing the host's runtime copy cannot hijack loadRemote/registerRemotes/getInstance.
