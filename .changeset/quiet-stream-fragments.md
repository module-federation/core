---
'@module-federation/bridge-react': patch
---

Reduce Bridge SSR stream preparation work by reusing HTML framing metadata, incrementally tracking pending bytes and searches, and avoiding repeated script and HTML copies while preserving data snapshot serialization and stream limits.
