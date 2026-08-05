---
'@module-federation/dts-plugin': patch
---

chore(dts-plugin): drop the `isomorphic-ws` dependency. Node-side server code now imports `ws` directly and browser-side code uses the global `WebSocket`, preserving Node 20 compatibility.
