---
'@module-federation/bridge-react': patch
---

Preserve ordinary HTTP error status through explicitly configured Service
ingresses and sanitized Host/browser error frames. Service deployment selection
comes from the producer response, without a Host build-version equality check.
Business HTTP conflicts do not replay requests or trigger generic CSR recovery.
Node updates never initiate browser reload or router revalidation.
