# Real Lynx Web E2E

`run.mjs` mounts the official Rspeedy `main.web.bundle` in the public
`@lynx-js/web-core` `<lynx-view>` client at a mobile viewport. It serves the
federation manifest and remote Lynx bundle over HTTP, exercises both import
styles and shared singleton state, and terminates its browser and ephemeral
server on success or failure.

Expected artifacts:

- `dist/host-web/main.web.bundle`
- `dist/remote-web/mf-manifest.json`
- `dist/remote-web/catalog.web.lynx.bundle`

Override them with `LYNX_HOST_WEB_BUNDLE`, `LYNX_REMOTE_MANIFEST`, and
`LYNX_REMOTE_WEB_BUNDLE`. A failed run writes
`test/real-web/artifacts/failure.png` (override with
`LYNX_WEB_E2E_SCREENSHOT`).
