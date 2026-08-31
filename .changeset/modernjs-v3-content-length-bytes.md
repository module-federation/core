---
'@module-federation/modern-js-v3': patch
---

Fix truncated remote chunks served from `/bundles` by computing `Content-Length` in bytes instead of characters. Chunks containing non-ASCII characters were cut short, causing `SyntaxError` when an SSR consumer evaluated them.
