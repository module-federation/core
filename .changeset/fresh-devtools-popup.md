---
'@module-federation/devtools': patch
---

Add page-level WebMCP tools for Module Federation inspection, proxy rules, HMR and loading traces. Build separate Chrome side-panel and embedded-browser popup extensions, with a compact popup layout and shared page configuration.

Use pinned umd-react 19.2.4 development builds for React 19 Fast Refresh, including react-dom/client and eager shared dependencies.

Register WebMCP tools at document start, retry late host API availability, and expose registration diagnostics.

Support WebMCP hosts that expose registerTool without unregisterTool.
