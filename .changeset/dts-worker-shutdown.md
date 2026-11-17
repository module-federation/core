---
'@module-federation/dts-plugin': patch
---

Stop the dev worker process when the compiler closes, and do not start it if the compiler closed while types were still generating.
