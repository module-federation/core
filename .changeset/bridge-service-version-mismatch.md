---
'@module-federation/bridge-react': patch
---

Preserve ordinary HTTP error status through explicitly configured Service
ingresses and sanitized Host/browser error frames. Keep the pre-render build
version check and reject stale requests with HTTP 409 without replaying them.
HTTP conflicts do not trigger generic CSR recovery. Development update and reload
remain coordinated by the framework after its Node runtime is ready.
