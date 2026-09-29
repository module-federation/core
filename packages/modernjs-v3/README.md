# @module-federation/modern-js-v3

This plugin integrates Module Federation with Modern.js. See the [Modern.js integration documentation](https://module-federation.io/guide/framework/modernjs.html) for general configuration.

## Independent Bridge application SSR

Bridge applications can render in the host's Node process or in a producer-owned HTTP service while keeping their own React root, React version, router, and Modern runtime. The host forwards complete HTML fragments as they become available; it does not wait for the entire remote application to become a string. The browser hydrates each application with its own renderer after the shell and initial loader snapshot arrive, while deferred content continues streaming. Legacy providers without a progressive snapshot hydrate after completion.

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

### Producer stylesheets

Bridge SSR collects CSS automatically from the loaded MF manifest for the exposed application. It includes the matching expose's synchronous and asynchronous CSS assets so that lazy routes have styles available. This is a conservative set for the expose, not a precise list of assets used by the current route. No additional demo or application configuration is required.

Stylesheet URLs known before the host head is emitted become ordinary `<link rel="stylesheet">` elements in that head. This follows the usual SSR stylesheet strategy: these links block the initial paint and can delay execution of the inline Bridge bootstrap that follows them. A slow stylesheet on this path can therefore delay the host and other remotes as well.

With a cold or lazy remote load, asset discovery may finish after the head has already streamed. Those URLs travel in the remote's `meta.stylesheets` frame; the browser immediately creates or reuses matching stylesheet links in the document head. On this late-metadata path, the browser retains each dependent remote's loading content until its stylesheets have loaded, then inserts its queued SSR fragments. This per-instance gate does not wait on stylesheets for unrelated remotes or hold up the host. The integration does not guarantee that every remote stylesheet appears in the initial head.

URLs are deduplicated, and existing applicable stylesheet links are reused. Once the Bridge bootstrap starts, CSS load failures and expiry of its existing SSR watchdog follow the whole-page CSR fallback policy described below. That watchdog cannot impose a timeout on the earlier native stylesheet blocking period before the bootstrap executes.

The generated MF runtime plugin uses the same Bridge ESM entry as the application components, keeping manifest asset collection on the initialized runtime instance. Standard Bridge CJS/ESM plugin entries are normalized and deduplicated while preserving plugin options; custom runtime plugins are unchanged.

## Server and browser lifecycle selection

`bridge: true` (or `bridge.exposes` on a producer) also installs `BridgeSSRPlugin` from `@module-federation/modern-js-v3/rspack`. In a Node Rspack compilation it resolves the internal `@module-federation/bridge-react/remote-lifecycle` import to its `.server` entry. Browser compilations retain the default lifecycle. This substitution is limited to the Bridge boundary; it does not change extension resolution for application files or other dependencies. Normal package import/require resolution is retained so the selected lifecycle uses the same Bridge package copy and module format as its caller.

Bridge publishes both lifecycle modules and keeps their import boundary external in its library build. Merely naming a source file `.server.ts` would not make that file selectable after bundling.

The component factories and `RemoteAppWrapper` keep one shared implementation of instance IDs, Suspense boundaries, refs, and container JSX. The server lifecycle registers SSR work and styles. The browser lifecycle handles mount/update/destroy and delegates stream claiming and hydration to its browser hydration helper. Generic Bridge CSR remains usable without Modern or this Rspack plugin. SSR hydration still runs in the browser; only Node registration is selected by the server build.

## Deployment and failure behavior

Publish the producer's MF manifest and browser assets for browser hydration and CSR. For local execution, also make the Node SSR entry and all referenced chunks available to the host: its MF Node loader executes that build in the host process, without an additional server. For HTTP-only execution, deploy the Node build to the producer service instead; the host requests, frames, and forwards that service's rendered output without loading or executing the producer Node expose. Only an explicitly enabled local fallback adds that Node-artifact requirement to an HTTP consumer. Static artifact delivery may itself use HTTP; downloading code is separate from requesting an HTTP rendering service.

The default path is SSR. Loading, rendering, stream completion, and hydration failures trigger a single whole-page navigation that sets `csr=1` and preserves other query parameters and the URL hash. Enable Modern's `server.ssr.forceCSR` on the host so that the next request selects CSR; this plugin does not change that Modern setting automatically. In CSR mode, the browser mounts the producer applications through their normal browser entries. A missing browser artifact can still fail and is shown by the component's error fallback.

A received stream is not proof of success: the protocol must reach its final snapshot and completion frame, and deferred React boundary insertion must finish. Truncated or stalled streams fall back after the deadline. Once a partial SSR response has been delivered, failure uses the same whole-page CSR navigation.

## Current limits

- Use distinct MF names for the host and producers. Do not share React, ReactDOM, React Router, or the Modern runtime between these applications; the Bridge configuration rejects those shared entries.
- Streaming completion script isolation has regression coverage with React 18.3.1 and React 19.2.8. It relies on React's internal streaming instructions, so other renderer versions need compatibility validation. The adapter recognizes React instruction shapes; it is not a sandbox for arbitrary JavaScript. React Form Actions' document-wide replay protocol is not supported by this isolation mechanism.
- React DOM 18 has a separate upstream UTF-8 buffer bug in the Node `renderToPipeableStream` renderer: multibyte characters at a buffer boundary can emit NUL bytes and cause hydration mismatches. See [React issue #31134](https://github.com/facebook/react/issues/31134) and the [official fix #26228](https://github.com/facebook/react/pull/26228). Independent development/production checks reproduced it in 18.1.0, 18.2.0, 18.3.0, and 18.3.1; 18.0.0 did not reproduce it. React 19 includes the fix (19.0.0 and 19.2.8 passed the same checks). The local Service App demo retains a pnpm patch backporting that fix to 18.3.1. MF does not patch React or remove bytes from the stream; a deployment using an affected renderer needs the upstream fix or a patched dependency. This finding is specific to that Node streaming path, not all React 18 rendering or ordinary CSR.
- Remote stream script replay supports inline classic scripts and forwards the SSR CSP nonce. External or module scripts inside the remote HTML stream are not supported; browser bundles load through Module Federation.

### Progressive application hydration

Modern application providers now expose an optional early hydration channel. Once the producer's complete shell marker has passed through the HTML framer, the host sends a `ready` frame containing an initial application snapshot. The browser can hydrate that independent root while subsequent `html` and opaque `update` frames are still arriving. Each instance owns its data stream; even repeated mounts of one producer do not share pending values.

The producer runtime encodes and restores deferred data. MF does not inspect route IDs or loader results. `done` still means the producer's HTML and data transport have finished; it is distinct from `ready` and from a React commit. Providers without the new channel retain the final snapshot / completion-first hydration path. Late errors, timeouts and cancellation remain active after early hydration begins. Known styles must be ready before the shell is exposed.

The local Service App integration is tested with patched React 18.3.1 and unmodified 19.2.8; see the React 18 note above. The host keeps the HTTP document stream open until all remote streams finish; streaming pending React markup into an already completed document is not covered. The protocol still depends on the tested React completion instructions and does not add RSC or Form Action replay support.

## Service App HTTP execution

Service App and local Bridge SSR use the same producer application, independent React root, Modern loader snapshot, HTML framer, script isolation, stylesheet gate, and browser hydration lifecycle. HTTP only changes how the host obtains the producer output. A Node-only deployment does not need to start another HTTP server.

Use `loadBridgeRemote` in the consumer's `createRemoteAppComponent` loader. In the host's Node build, its server entry supplies the remote module identity and a deferred local provider. Selecting HTTP never invokes that local provider, so a pure Service App host does not need to download, evaluate, or be able to run the producer's Node expose. This replaces the eager Node `loadRemote` dependency of the ordinary Bridge loader. The browser entry still loads the producer's real browser expose through MF for hydration or CSR; no producer Node code runs in the browser.

```tsx
import { createRemoteAppComponent } from '@module-federation/bridge-react';
import { loadBridgeRemote } from '@module-federation/modern-js-v3/bridge/remote';

const Weekend = createRemoteAppComponent({
  loader: () => loadBridgeRemote('weekend/app'),
  loading: <p>Loading…</p>,
  fallback: () => <p>Application unavailable.</p>,
});
```

Select the executor in the consumer's MF plugin options. This example is HTTP-only: `localFallback` defaults to `false` and is explicit below for clarity. Unlisted modules continue to execute their Node expose locally. If the service is unavailable, the HTTP-only path uses the existing whole-page CSR recovery without trying to load a producer Node build.

```ts
bridge: {
  services: {
    'weekend/app': {
      url: 'http://127.0.0.1:4801/services/render',
      revision: 'weekend-demo-v2',
      localFallback: false,
      timeoutMs: 15000,
    },
  },
}
```

To opt into HTTP-to-local recovery, set `localFallback: true` for that same module and make its matching Node build available through the configured MF remote. This is a separate deployment capability, not a Service App prerequisite; no extra remote alias or expose is needed to express the policy. The fallback is attempted only before HTTP metadata is accepted.

The producer sets `bridge: { exposes: { './app': true }, revision: 'weekend-demo-v2' }` and installs a Modern server middleware:

```ts
import { createBridgeServiceMiddleware } from '@module-federation/modern-js-v3/bridge/service';

const handler = createBridgeServiceMiddleware({
  path: '/services/render',
  manifest: 'http://127.0.0.1:4801/static/mf-manifest.json',
  module: 'weekend_provider/app',
  revision: 'weekend-demo-v2',
});
```

The middleware loads that producer's actual MF Node application and calls its `renderStream`, which delegates to Modern `renderApplication`. It does not create another React renderer. The producer may instead call `createBridgeServiceHandler({ revision, render })` with an existing Node application loader.

`mf-bridge-service/1` transports initial metadata, raw HTML byte chunks, the initial snapshot, opaque deferred updates, and completion over NDJSON. It is separate from the consumer-to-browser `mf-bridge/1` protocol: HTML framing and React instruction isolation stay with the consumer. Metadata binds the expected protocol, build revision, instance prefix, and hydration mode. Node and browser application adapters also stamp/check the revision on the snapshot. Deploy each revision's manifest and all browser/Node assets together at immutable URLs; this check detects a mismatch but does not repair a stale deployment.

The fetch executor returns once valid metadata arrives. HTML and deferred updates then drain concurrently. Neither HTTP nor local execution waits for an entire HTML string before emitting content or starting initial-document hydration. The final `done` requires both channels to complete. Frame and queue limits, request cancellation, and timeouts remain active during streaming.

An HTTP error before metadata is accepted may retry the local Node application when `localFallback` is enabled. Once a result is accepted, a later stream, protocol, stylesheet, or hydration error uses the existing whole-page `csr=1` recovery. It never splices output from a second render into the first root. A local fallback with a different revision is rejected. Keep the service URL in trusted deployment configuration and apply the service's normal authentication/network access controls; forwarded page context is input to rendering, not service authentication.

### Service requests from a CSR page

For requests initiated after the document has loaded, use `loadBridgeServiceRemote(moduleName, { url: '/services/render' })` from `@module-federation/modern-js-v3/bridge/client-service`. Install `createBridgeClientServiceMiddleware({ path: '/services/render', services })` from `@module-federation/modern-js-v3/bridge/client-service/server` on that consumer. This middleware accepts only configured module names and frames the upstream HTTP output with the same consumer-owned implementation. Request headers are forwarded only when explicitly listed in `forwardHeaders`.

This path still reveals HTML fragments as they arrive, but uses a final snapshot and hydrates after the remote stream completes. It does not opt into initial-document early hydration after the browser document has closed. `csr=1` skips the service and mounts the real browser application; updates and destruction always delegate to that application's normal Bridge lifecycle. `bridge: true` is supported on a CSR-only consumer; generating producer SSR application exposes still requires Modern SSR.
