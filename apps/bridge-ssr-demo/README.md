# Bridge SSR V1 acceptance demo

This focused demo proves buffered, application-level Bridge SSR in both cross-framework directions:

- React 18 host → Vue 3 remote
- Vue 3 host → React 18 remote

The server host calls `renderRemoteBridge`, carries the complete result in its normal SSR payload, and renders the same instance-scoped mount attributes on the server and client. The remote hydrates that mount when the payload and markers match; client navigation without a payload uses the existing CSR path.

Client and Node builds expose the same `./export-app` key from different source files. Preparation and the framework server renderer stay in the Node graph; hydration mapping stays browser-safe.

Run from the repository root:

```bash
pnpm run e2e:bridge:ssr
pnpm run e2e:bridge:ssr:production
pnpm run e2e:bridge:ssr:vite-smoke
```

Rsbuild development and production are required. The Vite command is a non-blocking React-host → Vue-remote smoke proof. The suites cover raw HTML, hydration, deep routes, host and remote navigation, CSR mounting, multiple independent instances, browser/server error monitoring, and exclusion of server-only renderers and preparation from browser bundles.

Assets and head management, response status/headers, fallbacks, timeouts, hydration recovery registries, data routers, streaming, and framework adapters are intentionally outside V1.
