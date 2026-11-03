---
'@module-federation/bridge-react': patch
---

Require React/React DOM 18+ for streaming SSR and hydration and document Node.js 20+ for SSR adapters. Keep React/React DOM 16.9+ pure CSR support, select its legacy adapter once per runtime, and preserve SSR identity instead of silently falling back when a modern API is missing.
