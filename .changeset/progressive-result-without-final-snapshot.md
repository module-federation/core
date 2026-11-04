---
'@module-federation/bridge-react': patch
---

Allow progressive Bridge SSR renderers to return an initial snapshot and data updates without calculating a final snapshot. Preserve complete hydration and renderers that provide both forms. Require a final snapshot when complete hydration is explicitly selected.
