---
'@module-federation/webpack-bundler-runtime': patch
---

Dispose and reattach bundler cache adapters across application rebuilds without retaining stale removal hooks or stacking MF instance wrappers. Coordinate multiple live bundlers on one MF instance and restore owned methods and listeners when the last adapter detaches.
