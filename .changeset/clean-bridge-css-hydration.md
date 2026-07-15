---
"@module-federation/bridge-react": patch
---

Remove hydrated bridge stylesheet links after mount when the same stylesheet is already present in the document head, while preserving SSR hydration markup.
