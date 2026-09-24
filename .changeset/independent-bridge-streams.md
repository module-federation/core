---
"@module-federation/bridge-react": minor
"@module-federation/modern-js-v3": minor
---

Add independent-root streaming SSR for Bridge applications. Modern hosts can load a remote application's Node build, stream its HTML alongside the host, and hydrate it with the remote's own React version and loader snapshot. Configure `bridge: true` on hosts and `bridge.exposes` on producers to generate the application entries and enable the integration. Failed SSR or hydration can fall back to a whole-page CSR reload when Modern's `forceCSR` option is enabled.
