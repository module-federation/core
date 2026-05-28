---
'@module-federation/dts-plugin': patch
---

chore(dts-plugin): drop `isomorphic-ws` and use `ws` directly. All call sites are Node-only (broker server, dev WebSocket client), so the cross-environment wrapper added no value. `Publisher.ts` only used `WebSocket` as a type, so its `ws` import is now `import type`.
