---
'@module-federation/bridge-react': minor
---

Extend the Bridge `memoryRoute` contract to support `initialEntries`, `initialIndex`, `initialState`, and `basename` alongside `entryPath`, export `normalizeBridgeMemoryRoute` / `bridgeMemoryEntryToPath` helpers, memoize memory/browser router instances inside React Router v6/v7 wrappers across Host rerenders, and validate the extended `memoryRoute` payload across the Service App HTTP boundary.
