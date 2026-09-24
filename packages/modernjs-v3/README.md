# @module-federation/modern-js-v3

This plugin integrates Module Federation with Modern.js. See the [Modern.js integration documentation](https://module-federation.io/guide/framework/modernjs.html) for general configuration.

## Independent Bridge application SSR

Bridge applications can render in the host's Node process while keeping their own React root, React version, router, and Modern runtime. The host forwards complete HTML fragments as they become available; it does not wait for the entire remote application to become a string. The browser hydrates each application with its own renderer after its stream, loader snapshot, and pending React boundaries have completed.

This integration requires the Modern application APIs `@modern-js/runtime/application` and `@modern-js/runtime/application/server`, plus request context, `shellEndMarker`, and `identifierPrefix` support in Modern's streaming SSR extension. Use a Modern build that includes these APIs; installing this MF plugin alone does not add them to older Modern releases. Generated entries use the producer's actual Modern route tree and loaders through `createApplication` and `renderApplication`.

Configure a host in `modern.config.ts`:

```ts
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: { ssr: { mode: 'stream', forceCSR: true } },
  plugins: [
    appTools(),
    moduleFederationPlugin({
      bridge: true,
      config: {
        name: 'commerce_host',
        remotes: {
          products: 'commerce_products@https://assets.example.com/products/mf-manifest.json',
        },
      },
    }),
  ],
});
```

Configure a producer application in its own `modern.config.ts`:

```ts
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: { ssr: { mode: 'stream', forceCSR: true } },
  output: { assetPrefix: 'https://assets.example.com/products/' },
  plugins: [
    appTools(),
    moduleFederationPlugin({
      bridge: { exposes: { './App': true } },
      config: { name: 'commerce_products' },
    }),
  ],
});
```

`true` selects the main Modern application entry. For a named entry, use `bridge: { exposes: { './App': 'entryName' } }`. The entry must use Modern's automatic application mounting. Expose names must start with `./` and must not duplicate `config.exposes`. To change the default 30-second SSR deadline, use `bridge: { timeoutMs: 10000 }` on the host.

Consume the application in a host component:

```tsx
import { createRemoteAppComponent } from '@module-federation/modern-js-v3/react';
import { loadRemote } from '@module-federation/modern-js-v3/runtime';

const Products = createRemoteAppComponent({
  loader: () => loadRemote('products/App'),
  loading: <p>Loading products…</p>,
  fallback: () => <p>Products could not be loaded.</p>,
});

export default function Dashboard() {
  return <Products memoryRoute={{ entryPath: '/' }} />;
}
```

`memoryRoute` selects the producer's initial route independently of the host URL. Pass JSON-serializable business props when they must participate in SSR. Each rendered instance receives a separate root, snapshot, and React identifier prefix, including multiple instances of the same producer.

## Deployment and failure behavior

Publish the producer's MF manifest, browser assets, and Node SSR entry with all its referenced chunks. The host uses the existing MF Node loader to load and execute that Node build in its own process. A producer SSR HTTP service or an additional per-producer server is not required. Static artifact delivery may still use HTTP; this is separate from calling an HTTP rendering service.

The default path is SSR. Loading, rendering, stream completion, and hydration failures trigger a single whole-page navigation that sets `csr=1` and preserves other query parameters and the URL hash. Enable Modern's `server.ssr.forceCSR` on the host so that the next request selects CSR; this plugin does not change that Modern setting automatically. In CSR mode, the browser mounts the producer applications through their normal browser entries. A missing browser artifact can still fail and is shown by the component's error fallback.

A received stream is not proof of success: the protocol must reach its final snapshot and completion frame, and deferred React boundary insertion must finish. Truncated or stalled streams fall back after the deadline. Once a partial SSR response has been delivered, failure uses the same whole-page CSR navigation.

## Current limits

- Use distinct MF names for the host and producers. Do not share React, ReactDOM, React Router, or the Modern runtime between these applications; the Bridge configuration rejects those shared entries.
- The current adapter executes Node builds locally. HTTP SSR transport and an HTTP-to-local rendering retry chain are not implemented.
- Streaming completion script isolation has regression coverage with React 18.3.1 and React 19.2.8. It relies on React's internal streaming instructions, so other renderer versions need compatibility validation. The adapter recognizes React instruction shapes; it is not a sandbox for arbitrary JavaScript. React Form Actions' document-wide replay protocol is not supported by this isolation mechanism.
- Remote stream script replay supports inline classic scripts and forwards the SSR CSP nonce. External or module scripts inside the remote HTML stream are not supported; browser bundles load through Module Federation.
