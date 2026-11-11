---
'@module-federation/bridge-react': patch
---

Expose typed Bridge Service build-version mismatches and preserve dedicated
pre-render 409 responses through explicitly configured transparent ingresses.
Keep authorization conflicts, cancelled requests and active streams outside
this protocol and never automatically replay Service requests.
