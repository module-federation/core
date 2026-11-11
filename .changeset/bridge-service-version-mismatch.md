---
'@module-federation/bridge-react': patch
---

Expose typed Bridge Service build-version mismatches and preserve dedicated
pre-render 409 responses through explicitly configured transparent ingresses.
Keep authorization conflicts, cancelled requests and active streams outside
this protocol and never automatically replay Service requests.

Preserve mismatch metadata through SSR and browser error frames. Surface these
errors without a generic CSR redirect, because CSR still uses the same Service
protocol. Other errors retain their existing recovery behavior.
