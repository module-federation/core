# @module-federation/modern-js-v3

This plugin integrates Module Federation with Modern.js. See the [Modern.js integration documentation](https://module-federation.io/guide/framework/modernjs.html) for general configuration.

## Implementation and review

The current integration combines [Bridge rendering callbacks in MF #5200](https://github.com/module-federation/core/pull/5200), [Modern callbacks in #9002](https://github.com/web-infra-dev/modern.js/pull/9002), and [Service render caching in MF #5201](https://github.com/module-federation/core/pull/5201). The cache PR includes the callback changes and is stacked on #5200. Joint HTTP/browser results and exact commands are in [CACHE-CALLBACKS-VERIFICATION.md](CACHE-CALLBACKS-VERIFICATION.md). These draft PRs build on the earlier SSR branches and are not published package capabilities.

Review the explicit provider and framework callbacks in [BRIDGE-RENDERER-CALLBACKS.md](BRIDGE-RENDERER-CALLBACKS.md), then the Service transport and cache below. The Service App demo uses the same provider for HTTP SSR, local SSR and browser hydration. A future move of the plugin integration into Modern itself is separate work.

## Independent Bridge application SSR

Bridge applications can render in the host's Node process or in a producer-owned HTTP service while keeping their own React root, React version, router, and Modern runtime. The host forwards complete HTML fragments as they become available; it does not wait for the entire remote application to become a string. The browser hydrates each application with its own renderer after the shell and initial loader snapshot arrive, while deferred content continues streaming. Legacy providers without a progressive snapshot hydrate after completion.

This integration requires the matching Modern build with `@modern-js/runtime/mf` rendering callbacks and its underlying independent application APIs. Installing the MF plugin alone does not add them to older Modern releases. Modern's streaming SSR extension must also supply request context, `shellEndMarker` and `identifierPrefix`.

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

Export the producer's root application from `src/bridge.tsx`:

```tsx
import '@modern-js/runtime/registry/index';
import { createRoot } from '@modern-js/runtime/react';
import { render, hydrate, renderStream } from '@modern-js/runtime/mf';
import { createBridgeComponent } from '@module-federation/modern-js-v3/react-v19';

const ModernRoot = createRoot();
export default createBridgeComponent({
  rootComponent: ModernRoot,
  render,
  hydrate,
  renderStream,
});
```

Use `react-v18` for a React 18 producer. Declare the ordinary expose in `module-federation.config.ts`:

```ts
export default {
  name: 'commerce_products',
  exposes: { './App': './src/bridge.tsx' },
};
```

Configure the current plugin integration in `modern.config.ts`:

```ts
import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: { ssr: { mode: 'stream', forceCSR: true } },
  output: { assetPrefix: 'https://assets.example.com/products/' },
  plugins: [
    appTools(),
    moduleFederationPlugin({
      bridge: { revision: 'products-v1' },
    }),
  ],
});
```

The same provider source is compiled for Node and browser. The build plugin selects the framework and Bridge server entries for Node while preserving the root component. The older generated `bridge.exposes` providers remain supported, but are not required for this callback entry. To change the default 30-second SSR deadline, use `bridge: { timeoutMs: 10000 }` on the host.

Consume the application in a host component:

```tsx
import { createRemoteAppComponent } from '@module-federation/modern-js-v3/react';
import { loadBridgeRemote } from '@module-federation/modern-js-v3/bridge/remote';

const Products = createRemoteAppComponent({
  loader: () => loadBridgeRemote('products/App'),
  loading: <p>Loading products…</p>,
  fallback: () => <p>Products could not be loaded.</p>,
});

export default function Dashboard() {
  return <Products memoryRoute={{ entryPath: '/' }} />;
}
```

`memoryRoute` selects the producer's initial route independently of the host URL. Pass JSON-serializable business props when they must participate in SSR. Each rendered instance receives a separate root, snapshot, and React identifier prefix, including multiple instances of the same producer.

## Rendering and hydration sequence

The producer owns its Modern application definition, loaders, runtime context and React renderer. Bridge constructs the tree from `rootComponent` and the request props, then passes it to the injected `renderStream` callback. Modern calls `renderApplication` with that tree and request, without a second document template. The browser uses the corresponding `hydrate` callback to restore the same application in its own container.

The callback returns `stream`, `snapshot`, `abort` and optional `hydration: { snapshot, updates, shellMarker }`. The snapshot contains serializable props, route and loader data, URL and React prefix. MF transports it as opaque data. Modern restores it through `createApplication(element)`, and later Bridge renders update the existing instance. The producer Node adapter converts that raw result into `BridgeSSRMessageResult` with `protocol: "mf-bridge-producer/1"`, a hydration mode and a stream of prepared messages. Business callbacks keep their existing signature. A local provider that still returns unadapted raw bytes must be rebuilt with the current adapter. Callback types and build entry selection are described in [BRIDGE-RENDERER-CALLBACKS.md](BRIDGE-RENDERER-CALLBACKS.md).

On the host, `createRemoteAppComponent` derives an instance ID from host `useId` and pre-registers work before the lazy module settles, using `deferRender: true`. The server lifecycle in `RemoteAppWrapper` later activates the same job with final routing parameters. `bridgeStreamPlugin` supplies `BridgeSSRContext` and a separate job map for each request through Modern's `api.extendStreamSSR`; these are not global jobs shared across requests. Each job selects an executor: the local path loads the producer's Node module and calls `renderStream` in the host process; the HTTP path obtains the same result contract from the producer service. The HTTP-only path never invokes the deferred local provider.

```text
Host raw React stream → hostPieces → isolated Host scripts → raw Host HTML
Producer React stream → producer htmlFrames + script isolation + readiness
                                  ↓
                    prepared messages (local or HTTP/cache)
                                  ↓
              Host accept(id, message) → document response
                                  ↓
       browser bootstrap → Remote container → producer hydrateRoot
```

`hostPieces` reads the raw Host React stream before Modern applies the document template. It first emits the shell together with Modern's existing shell marker, then delegates later pieces to `htmlFrames`. Each producer uses `htmlFrames` from the start in its Node adapter. The Host consumes the resulting `BridgeSSRMessageResult` without reframing it. The compositor releases Remote frames after writing the initial Host shell; this does not wait for all Host Suspense work, browser paint, or Host hydration. Producer loading/rendering can begin earlier. A Remote discovered by later Host Suspense can have a container that appears later, so the browser still queues its frames.

`htmlFrames` runs in the producer adapter for each Remote and in the document owner for its own Host output. It buffers arbitrary byte chunks into complete top-level HTML fragments while preserving their order. It does not route fragments by ID, execute React scripts, or detect application completion. Host fragments remain raw HTML; Remote fragments become inline `accept(instanceId, frame)` calls. This prevents inserting Remote instructions into a half-written Host tag/script and lets the browser parse each Remote fragment independently. A single stream's byte order is preserved; only complete output units from different renderers are interleaved.

The browser runs `bridgeStreamBootstrap`, not the server HTML framer. It is currently injected through `getStyleTags` to execute before the first `accept` call; a dedicated early-bootstrap hook is a follow-up, and must retain ordering and nonce support. The bootstrap waits for each container and its CSS, parses fragments through a template, inserts them, and executes the producer renderer's inline completion scripts. It removes the initial Host loading content itself; React-generated completion scripts perform the subsequent Suspense fallback replacements. `isolateReactStreamScripts` runs in the producer adapter and rewrites known helper identifiers with a per-renderer namespace before transport; it does not replace React's DOM-update algorithm.

In progressive mode, the producer encodes an initial snapshot with pending-value references. The producer emits `ready` after its complete shell marker passes framing and its initial snapshot is available. The Host forwards that message; the browser waits for the container, CSS and browser module, then calls the producer's `hydrate` once. Later HTML and opaque `update` frames resolve deferred boundaries in that same root. `done` signals completed transport and does not call `hydrateRoot` again. Providers without a progressive channel use the complete path: the producer resolves the final snapshot after HTML completion and recursive data resolution, the producer emits `data/done`, and the browser hydrates after its completion gate. An SSR instance does not race a separate CSR mount: lifecycle updates queue behind initialization. Without an SSR session, it uses ordinary CSR mounting.

### Host readiness is separate from Remote readiness

Modern's document-level `window._SSR_DATA_READY` promise prevents an async Host entry from reading hydration data before the HTML parser reaches it. It is resolved after Host shell data, not after all Remote streams. The current Remote Node entry bypasses document templates, and its browser entry uses an explicit snapshot rather than the ordinary page `render()` path. Remotes therefore neither overwrite nor wait on this Host promise; each uses its own Bridge `session.ready` for progressive hydration and `session.done` for completion (or complete-mode hydration).

This assumes one ordinary Modern document owner. Injecting multiple complete Modern page templates into the same document could overwrite `_SSR_DATA_READY`, its resolver, and other page-level data. Service App integration must use application fragments and instance-scoped data, or a separate document; directly forwarding an entire page template is not supported by this protocol.

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

Publish the producer's MF manifest and browser assets for browser hydration and CSR. For local execution, also make the Node SSR entry and all referenced chunks available to the host: its MF Node loader executes that build in the host process, without an additional server. For HTTP-only execution, deploy the Node build to the producer service instead; the host requests and forwards that service's prepared messages without loading or executing the producer Node expose. Only an explicitly enabled local fallback adds that Node-artifact requirement to an HTTP consumer. Static artifact delivery may itself use HTTP; downloading code is separate from requesting an HTTP rendering service.

The default path is SSR. Loading, rendering, stream completion, and hydration failures trigger a single whole-page navigation that sets `csr=1` and preserves other query parameters and the URL hash. Enable Modern's `server.ssr.forceCSR` on the host so that the next request selects CSR; this plugin does not change that Modern setting automatically. In CSR mode, the browser mounts the producer applications through their normal browser entries. A missing browser artifact can still fail and is shown by the component's error fallback.

A received stream is not proof of success: the selected protocol must deliver the required snapshot/data updates and its completion frame, and deferred React boundary insertion must finish. Truncated or stalled streams fall back after the deadline. Once a partial SSR response has been delivered, failure uses the same whole-page CSR navigation.

## Current limits

- Use distinct MF names for the host and producers. Do not share React, ReactDOM, React Router, or the Modern runtime between these applications; the Bridge configuration rejects those shared entries.
- Streaming completion script isolation has regression coverage with React 18.3.1 and React 19.2.8. It relies on React's internal streaming instructions, so other renderer versions need compatibility validation. The adapter recognizes React instruction shapes; it is not a sandbox for arbitrary JavaScript. React Form Actions' document-wide replay protocol is not supported by this isolation mechanism.
- React DOM 18 has a separate upstream UTF-8 buffer bug in the Node `renderToPipeableStream` renderer: multibyte characters at a buffer boundary can emit NUL bytes and cause hydration mismatches. See [React issue #31134](https://github.com/facebook/react/issues/31134) and the [official fix #26228](https://github.com/facebook/react/pull/26228). Independent development/production checks reproduced it in 18.1.0, 18.2.0, 18.3.0, and 18.3.1; 18.0.0 did not reproduce it. React 19 includes the fix (19.0.0 and 19.2.8 passed the same checks). The local Service App demo retains a pnpm patch backporting that fix to 18.3.1. MF does not patch React or remove bytes from the stream; a deployment using an affected renderer needs the upstream fix or a patched dependency. This finding is specific to that Node streaming path, not all React 18 rendering or ordinary CSR.
- Remote stream script replay supports inline classic scripts and forwards the SSR CSP nonce. External or module scripts inside the remote HTML stream are not supported; browser bundles load through Module Federation.

### Progressive application hydration

Modern application providers now expose an optional early hydration channel. The producer adapter sends `ready` after framing its complete shell and obtaining the initial snapshot. The Host forwards that message unchanged. The browser can hydrate that independent root while subsequent `html` and opaque `update` frames are still arriving. Each instance owns its data stream; even repeated mounts of one producer do not share pending values.

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

The producer uses the explicit callback provider shown above, exposes it as `config.exposes: { './app': './src/bridge.tsx' }`, sets `bridge: { revision: 'weekend-demo-v2' }`, and installs a Modern server middleware:

```ts
import { createBridgeServiceMiddleware } from '@module-federation/modern-js-v3/bridge/service';

const handler = createBridgeServiceMiddleware({
  path: '/services/render',
  manifest: 'http://127.0.0.1:4801/static/mf-manifest.json',
  module: 'weekend_provider/app',
  revision: 'weekend-demo-v2',
  cache: { maxAgeMs: 60_000 },
});
```

The middleware loads that producer's actual MF Node application and calls its `renderStream`, which delegates to Modern `renderApplication`. It does not create another React renderer. The producer may instead call `createBridgeServiceHandler({ revision, render })` with an existing Node application loader.

`mf-bridge-service/2` transports metadata followed by complete `html` string messages, `ready` with the initial snapshot, opaque `update` values, and `done`. Complete mode uses `data` with the final snapshot instead of `ready/update`. Each JSON record ends with a newline, with newlines inside HTML escaped by JSON. The producer adapter performs HTML framing, React instruction isolation and readiness checks once. Consumers validate record order and size and forward messages without parsing HTML or rewriting scripts. The browser envelope remains `mf-bridge/1`. Service producers and consumers must upgrade together; version 1 raw-byte responses are rejected. Metadata binds the expected protocol, build revision, instance prefix, and hydration mode. Node and browser application adapters also stamp/check the revision on the snapshot. Deploy each revision's manifest and all browser/Node assets together at immutable URLs; this check detects a mismatch but does not repair a stale deployment.

The fetch executor returns once valid metadata arrives. HTML and deferred updates then drain concurrently. Neither HTTP nor local execution waits for an entire HTML string before emitting content or starting initial-document hydration. The final `done` requires HTML and deferred data to complete. The default HTML-unit limit is 2 MiB, each serialized HTTP record is limited to 3 MiB, and pending message queues are limited to 4 MiB. JSON escaping can enlarge a record, so a complete HTML unit can still exceed the wire limit and fail. Queue limits do not bound total renderer or parser memory. Request cancellation and timeouts remain active during streaming. Node `destination.flush()` is not used as a framing boundary.

### Render caching

The producer example above enables an in-process render cache with a 60-second lifetime. The same `cache` option is available on `createBridgeServiceHandler`. Choose a lifetime acceptable for that application's data; caching is not enabled when the option is omitted. A hit skips rendering, HTML framing and script isolation and replays its completed `mf-bridge-service/2` transcript, including HTML, snapshots, deferred updates, stylesheets and completion. A miss streams each complete HTML unit as it becomes available, without waiting for the whole render. Only successfully completed transcripts are committed; failed, interrupted or oversized recordings do not enter the cache. The cache never rewrites React HTML, IDs, completion scripts or opaque snapshots.

A hit also skips provider creation, render lifecycle hooks and Modern request hooks. Put authentication and auditing that must run for every request outside the cached middleware. Renderers must tolerate being skipped and must not rely on SSR to perform writes. Replayed frames retain their order and bytes, not the original delays.

The defaults are 128 entries, 32 MiB of retained transcript bytes and 1 MiB per entry. Override them with `maxEntries`, `maxBytes` and `maxEntryBytes`; all limits and `maxAgeMs` must be positive safe integers, and the entry limit cannot exceed the total byte limit. Entries expire from their completion time, and reads do not extend that lifetime. Capacity eviction uses least-recently-used order. Concurrent misses render independently. Each handler owns its cache; workers and replicas do not share it, and a process restart clears it.

The cache key hashes the complete serialized protocol request, including revision, hydration mode, module, URL, props, routing options, instance ID, React prefix, headers and nonce. Nothing is silently omitted. Initial SSR uses a stable, collision-free encoding of the Bridge instance ID as the Remote's React prefix: the same slot can hit across page requests, while two slots on one page have separate cached variants. A changed Host tree or any changed render input can cause a miss. A new build revision cannot consume an older revision's entries. Database changes and other state outside the request remain subject to the configured lifetime.

Cookies, request-specific headers and CSP nonces can reduce reuse or prevent hits across requests. Those values are available to arbitrary producers and may affect their HTML or hydration state, so the cache does not discard or replace them to manufacture hits. Cache eligibility and input normalization must follow the application's actual rendering contract. For example, a provider that renders a nonce into its HTML and snapshot cannot share that exact output with a request carrying a different nonce.

`x-mf-bridge-cache: hit` or `miss` reports the producer lookup when caching is enabled. Service POST responses retain `Cache-Control: no-store`: an ordinary HTTP cache keyed by URL cannot distinguish their render request bodies. This header does not disable the producer's render cache. HTTP/CDN caching and a shared persistent cache backend are not implemented by this option.

Fast replay must fit the consumer's pending-byte budget. The fetch executor advertises `maxBufferedBytes` in the `x-mf-bridge-buffer-bytes` transport header; it is not exposed as a producer render input. A transcript larger than that budget is rendered live instead of replayed, even if stored. Clients omitting the header use the existing 4 MiB default; clients with a custom smaller budget must advertise it. This preserves the existing bounded multiplexed transport without claiming end-to-end backpressure. Increasing a cache entry limit alone does not increase a consumer's buffer budget.

An HTTP error before metadata is accepted may retry the local Node application when `localFallback` is enabled. Once a result is accepted, a later stream, protocol, stylesheet, or hydration error uses the existing whole-page `csr=1` recovery. It never splices output from a second render into the first root. A local fallback with a different revision is rejected. Keep the service URL in trusted deployment configuration and apply the service's normal authentication/network access controls; forwarded page context is input to rendering, not service authentication.

### Service requests from a CSR page

For requests initiated after the document has loaded, use `loadBridgeServiceRemote(moduleName, { url: '/services/render' })` from `@module-federation/modern-js-v3/bridge/client-service`. Install `createBridgeClientServiceMiddleware({ path: '/services/render', services })` from `@module-federation/modern-js-v3/bridge/client-service/server` on that consumer. This middleware accepts only configured module names and forwards upstream prepared messages in the browser envelope. It does not parse the producer HTML or rewrite its scripts. Request headers are forwarded only when explicitly listed in `forwardHeaders`.

This path still reveals HTML fragments as they arrive, but uses a final snapshot and hydrates after the remote stream completes. It does not opt into initial-document early hydration after the browser document has closed. `csr=1` skips the service and mounts the real browser application; updates and destruction always delegate to that application's normal Bridge lifecycle. `bridge: true` is supported on a CSR-only consumer; generating producer SSR application exposes still requires Modern SSR.

Delivery sessions retain random IDs. For the first use of a unique, valid container ID in a document, the client sends a separate stable render identity, allowing that slot to reuse a producer cache entry across documents. Missing, duplicate, invalid or previously used container identities fall back to the random session identity. In particular, remounting within one document does not reuse an old React instruction namespace. Older clients without a separate render identity remain supported.

## Planned React compatibility matrix

The full integration matrix recorded on 2026-09-28 remains a test requirement, not completed coverage or a broader support claim. Existing integration regressions cover React 18.3.1 and 19.2.8, with the Service App demo using patched 18.3.1. A separate encoding-only audit covered all five stable React 18 versions plus 19.0.0/19.2.8, development/production, Node Pipeable/Web Readable, for 33,600 renders. That audit identifies the UTF-8 defect described above; it does not complete the integration matrix.

- React 19: cover every stable release, including patch releases, rather than only the latest version of each minor. Canary, experimental, alpha, beta, and RC releases are outside this initial matrix.
- React 18: cover most stable releases, including every minor line and broad patch coverage. When implementing the matrix, check in the exact version list and document any omissions and their reasons; one latest-only case is insufficient.
- React 17: retain only the latest stable 17.x release. Cover the generic Bridge CSR mount/update/destroy behavior separately. The current Modern independent streaming SSR path uses React 18+ APIs (`renderToPipeableStream`, `hydrateRoot`, and host `useId`); a React 17 test must not be reported as support for that same streaming path. Supporting legacy React 17 SSR would require a separately designed adapter.

Resolve `react` and `react-dom` as matching exact versions for each case and record the versions tested. Refresh the explicit matrix when stable releases are added; do not let a floating `latest` replace historical coverage. React's API transition is documented in the [React 18 upgrade guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-server-rendering-apis).

Use actual renderer output, not only handwritten `$RC` fixtures. For supported SSR cases, validate byte-boundary framing, nested and multiple Suspense boundaries, both completion orders, errors/abort/truncation, script helper isolation, DOM reuse during hydration, and post-hydration interactions. Include mixed Host/Remote versions, multiple producers, and repeated instances of the same producer; record which combinations were exercised separately from per-version coverage. Generic CSR and instance teardown must remain independently tested.

Unknown React completion instruction shapes currently pass through unchanged. The expanded matrix must expose missed or partial script isolation; a successful check on the two current demo versions is not evidence that untested versions or unsupported document-wide React protocols are safe.

## Production readiness and remaining work

The current implementation demonstrates feasibility for the tested React versions and commerce scenarios; it is not a production compatibility guarantee for arbitrary React applications or versions. A controlled deployment with explicit version/feature constraints is a plausible next step after the gates below pass. If independently deployed producers must upgrade React freely without coordinated adapter validation, the current reliance on private completion instructions does not meet that requirement.

| Area                                              | Can the risk be removed?                                                            | Current limitation and required follow-up                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React completion script rewriting and DOM markers | Reduced, not eliminated by tests while private formats remain a dependency          | Known helper names, syntax, IDs, and comments can change. Unknown script shapes currently pass through unchanged, allowing missed/partial isolation. Require a tested version/feature allowlist and explicit handling of unsupported React instruction shapes; do not blindly reject arbitrary business scripts or assume all unrecognized output is safe. |
| HTML framing and insertion                        | Engineering risk that can be reduced within an explicit HTML contract               | `htmlparser2` and browser fragment parsing are not identical. Cover context-sensitive HTML, UTF-8 splits, truncation, nested Suspense, and script order in real browsers; large top-level elements delay a frame and hit the configured size limit.                                                                                                        |
| Hydration start time                              | Depends on the selected hydration mode and tested document lifetime                 | Initial-document SSR supports early hydration with an initial snapshot, pending references and updates. Legacy providers and Service requests initiated after document load retain complete-mode hydration. Validate late boundary interaction and state retention separately from HTML visibility.                                                        |
| Host readiness globals and runtime sharing        | Avoidable under the supported ownership model; broader sharing requires refactoring | Keep one document owner and use explicit per-instance snapshots. Modern still has application-level registry globals; different producers cannot safely share its singleton simply because their React versions match.                                                                                                                                     |
| Bootstrap injection                               | Can be addressed in the framework API                                               | `getStyleTags` currently also injects JavaScript. Add a dedicated early-bootstrap contract without losing script ordering, document scoping, or CSP nonce propagation.                                                                                                                                                                                     |
| Failure and resource management                   | Mitigations exist; production behavior still needs validation                       | Timeout/abort, frame/queue limits, and one-page CSR fallback exist. Validate slow clients, proxy/compression buffering, disconnects, memory/backpressure, concurrent requests, and resource failures. CSR fallback is not proof that incorrect DOM or cross-instance interference cannot occur.                                                            |

Before production rollout, complete and report the planned React compatibility matrix, test supported mixed-renderer combinations with real browsers, gate unsupported output before it can interfere with another renderer, and define measurable limits for interaction delay, memory, timeouts, and fallback frequency. Capture instance/version/stage diagnostics before any reload and provide a rollout/rollback mechanism. These are pending acceptance criteria, not checks that this demo has already passed.

Service HTTP execution is implemented in this consolidated PR and uses the same Modern application renderer and downstream Bridge composition/hydration. A pure HTTP host has no producer Node-execution prerequisite; explicit local fallback requires matching Node artifacts and is limited to failures before accepted metadata. The remaining built-in integration work concerns package ownership and exports, not inventing a separate Service renderer. Business status/headers/redirect propagation, full renderer-version admission and production resource testing remain separate follow-ups.
