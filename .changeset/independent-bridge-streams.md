---
'@module-federation/bridge-react': minor
'@module-federation/modern-js-v3': minor
---

Add independent-root streaming SSR for Bridge applications. Modern hosts can load a remote application's Node build, stream its HTML alongside the host, and hydrate it with the remote's own React version and loader snapshot. Configure `bridge: true` on hosts and `bridge.exposes` on producers to generate the application entries and enable the integration. Failed SSR or hydration can fall back to a whole-page CSR reload when Modern's `forceCSR` option is enabled.

Automatically collect the exposed application's synchronous and asynchronous CSS from its MF manifest, emit known stylesheet links in the host head, and deliver later discoveries with stream metadata. Keep each remote's loading content until its deduplicated stylesheets are ready, with CSS failures following the existing CSR fallback policy. Normalize the Bridge runtime plugin to the same ESM entry used by its components so that asset collection uses the initialized runtime instance.
