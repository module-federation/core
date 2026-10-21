---
'@module-federation/modern-js': patch
'@module-federation/modern-js-v3': patch
---

Harden SSR `/bundles` and JSON asset serving against path traversal, and set `Content-Length` from UTF-8 byte length so non-ASCII federated chunks are not truncated.
