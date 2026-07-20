# Bridge SSR V1 acceptance demo

This focused demo proves buffered, application-level Bridge SSR in both cross-framework directions:

- React 18 host → Vue 3 remote
- Vue 3 host → React 18 remote

The server host calls `renderRemoteBridge` and passes the complete result to its remote component. That component emits a single instance-scoped document slot which owns the remote HTML and dehydrated state. The host hydration JSON contains only a versioned identity reference, so the remote HTML is transferred once.

Before React `hydrateRoot` or the Vue host mount, the client creates a hydration registry from the document and installs it through the framework adapter. The reference resolves a validated snapshot from that registry. Successful hydration consumes the snapshot once; a later SPA revisit uses CSR. A missing slot also uses CSR, while malformed, duplicate, or identity-conflicting slots surface contextual errors.

Client and Node builds expose the same `./export-app` key from different source files. Preparation and the framework server renderer stay in the Node graph; hydration mapping stays browser-safe.

Run from the repository root:

```bash
pnpm run e2e:bridge:ssr
pnpm run e2e:bridge:ssr:production
pnpm run e2e:bridge:ssr:vite-smoke
```

Rsbuild development and production are required. The Vite command is a non-blocking React-host → Vue-remote smoke proof. The suites cover raw HTML, single-copy transport, hydration, deep routes, host and remote navigation, CSR revisits after consumption, multiple independent instances, browser/server error monitoring, and exclusion of server-only renderers and preparation from browser bundles.

React Router v6 remotes use the strict `router-v6` alias in browser and Node builds; the browser bundle checks are release gates, not documentation-only guidance. Assets and head management, response status/headers, shared fallbacks and timeouts, data routers, streaming, and additional framework adapters are intentionally outside V1. Without a host-owned wrapper, a slow or broken remote can delay or fail the host response.
