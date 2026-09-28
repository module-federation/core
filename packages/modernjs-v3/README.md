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

## Rendering and hydration sequence

The producer owns its Modern application definition, loaders, runtime context, and React renderer. At build time, `bridge.exposes` generates two entries that import the producer's registry: the Node entry exports `createModernServerBridge({ renderApplication })`, and the browser entry exports `createModernBrowserBridge({ createApplication })`. The build generates these calls; it does not execute SSR. Automatic detection of application exports in ordinary `config.exposes` is not implemented.

`renderApplication(request, options)` returns an HTML `stream`, a `snapshot` promise, and `cancel`. It reuses Modern's request preparation and loaders but renders application content without the outer document template. `createApplication()` provides browser `mount`, `hydrate`, `update`, and `destroy`. The snapshot contains serializable initial state (including props, URL, basename, identifier prefix, initial data, and route loader data/errors), not the complete runtime context or React component state. MF transports it as opaque data; the producer's browser runtime consumes it. Consumer prop/URL changes reach `update` through subsequent Bridge `render` calls on the existing instance.

On the host, `createRemoteAppComponent` derives an instance ID from host `useId` and pre-registers work before the lazy module settles, using `deferRender: true`. The server lifecycle in `RemoteAppWrapper` later activates the same job with final routing parameters. `bridgeStreamPlugin` supplies `BridgeSSRContext` and a separate job map for each request through Modern's `api.extendStreamSSR`; these are not global jobs shared across requests. Each job loads the producer's Node module and calls its `renderStream` in the host process. No producer HTTP rendering service is used.

```text
Host raw React stream → hostPieces → isolated Host scripts → raw Host HTML
Remote React stream   → htmlFrames → isolated Remote scripts → accept(id, frame)
                                  ↓
                  Modern document template → HTTP response
                                  ↓
       browser bootstrap → Remote container → producer hydrateRoot
```

`hostPieces` reads the raw Host React stream before Modern applies the document template. It first emits the shell together with Modern's existing shell marker, then delegates later pieces to `htmlFrames`. Remote output uses `htmlFrames` from the start. The compositor releases Remote frames after writing the initial Host shell; this does not wait for all Host Suspense work, browser paint, or Host hydration. Producer loading/rendering can begin earlier. A Remote discovered by later Host Suspense can have a container that appears later, so the browser still queues its frames.

`htmlFrames` runs on the server. It buffers arbitrary byte chunks into complete top-level HTML fragments while preserving their order. It does not route fragments by ID, execute React scripts, or detect application completion. Host fragments remain raw HTML; Remote fragments become inline `accept(instanceId, frame)` calls. This prevents inserting Remote instructions into a half-written Host tag/script and lets the browser parse each Remote fragment independently. A single stream's byte order is preserved; only complete output units from different renderers are interleaved.

The browser runs `bridgeStreamBootstrap`, not the server HTML framer. It is currently injected through `getStyleTags` to execute before the first `accept` call; a dedicated early-bootstrap hook is a follow-up, and must retain ordering and nonce support. The bootstrap waits for each container and its CSS, parses fragments through a template, inserts them, and executes the producer renderer's inline completion scripts. It removes the initial Host loading content itself; React-generated completion scripts perform the subsequent Suspense fallback replacements. `isolateReactStreamScripts` rewrites known helper identifiers with a per-renderer namespace before transport; it does not replace React's DOM-update algorithm.

The producer resolves its snapshot after the output stream's writable `finish` and recursive resolution of snapshot data. This is not browser completion. The host drains the producer HTML stream, awaits the snapshot, then sends `data` and `done` frames. In the browser, `done` marks stream completion; CSS readiness and pending Suspense DOM changes must also complete before `session.done` resolves. Bridge then calls the producer's `hydrate` and ultimately its own `hydrateRoot`. An SSR instance does not race a separate CSR mount: lifecycle updates queue behind hydration. Without an SSR session, it uses ordinary CSR mounting.

### Host readiness is separate from Remote readiness

Modern's document-level `window._SSR_DATA_READY` promise prevents an async Host entry from reading hydration data before the HTML parser reaches it. It is resolved after Host shell data, not after all Remote streams. The current Remote Node entry bypasses document templates, and its browser entry uses an explicit snapshot rather than the ordinary page `render()` path. Remotes therefore neither overwrite nor wait on this Host promise; each uses its own Bridge `session.done`.

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

Publish the producer's MF manifest, browser assets, and Node SSR entry with all its referenced chunks. The host uses the existing MF Node loader to load and execute that Node build in its own process. A producer SSR HTTP service or an additional per-producer server is not required. Static artifact delivery may still use HTTP; this is separate from calling an HTTP rendering service.

The default path is SSR. Loading, rendering, stream completion, and hydration failures trigger a single whole-page navigation that sets `csr=1` and preserves other query parameters and the URL hash. Enable Modern's `server.ssr.forceCSR` on the host so that the next request selects CSR; this plugin does not change that Modern setting automatically. In CSR mode, the browser mounts the producer applications through their normal browser entries. A missing browser artifact can still fail and is shown by the component's error fallback.

A received stream is not proof of success: the protocol must reach its final snapshot and completion frame, and deferred React boundary insertion must finish. Truncated or stalled streams fall back after the deadline. Once a partial SSR response has been delivered, failure uses the same whole-page CSR navigation.

## Current limits

- Use distinct MF names for the host and producers. Do not share React, ReactDOM, React Router, or the Modern runtime between these applications; the Bridge configuration rejects those shared entries.
- The current adapter executes Node builds locally. HTTP SSR transport and an HTTP-to-local rendering retry chain are not implemented.
- Streaming completion script isolation has regression coverage with React 18.3.1 and React 19.2.8. It relies on React's internal streaming instructions, so other renderer versions need compatibility validation. The adapter recognizes React instruction shapes; it is not a sandbox for arbitrary JavaScript. React Form Actions' document-wide replay protocol is not supported by this isolation mechanism.
- Remote stream script replay supports inline classic scripts and forwards the SSR CSP nonce. External or module scripts inside the remote HTML stream are not supported; browser bundles load through Module Federation.

## Planned React compatibility matrix

This is a test requirement recorded on 2026-09-28, not completed coverage or a broader support claim. The current real-renderer regressions cover React 18.3.1 and 19.2.8 only.

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
| Hydration start time                              | Current design tradeoff; improvement requires additional implementation             | HTML is displayed progressively, but a Remote starts hydration only after its complete snapshot/stream. A slow loader can delay interaction in already visible parts of that Remote. Early hydration needs initial state plus per-instance deferred-data delivery and coordination with ongoing DOM insertion; it is not implemented.                      |
| Host readiness globals and runtime sharing        | Avoidable under the supported ownership model; broader sharing requires refactoring | Keep one document owner and use explicit per-instance snapshots. Modern still has application-level registry globals; different producers cannot safely share its singleton simply because their React versions match.                                                                                                                                     |
| Bootstrap injection                               | Can be addressed in the framework API                                               | `getStyleTags` currently also injects JavaScript. Add a dedicated early-bootstrap contract without losing script ordering, document scoping, or CSP nonce propagation.                                                                                                                                                                                     |
| Failure and resource management                   | Mitigations exist; production behavior still needs validation                       | Timeout/abort, frame/queue limits, and one-page CSR fallback exist. Validate slow clients, proxy/compression buffering, disconnects, memory/backpressure, concurrent requests, and resource failures. CSR fallback is not proof that incorrect DOM or cross-instance interference cannot occur.                                                            |

Before production rollout, complete and report the planned React compatibility matrix, test supported mixed-renderer combinations with real browsers, gate unsupported output before it can interfere with another renderer, and define measurable limits for interaction delay, memory, timeouts, and fallback frequency. Capture instance/version/stage diagnostics before any reload and provide a rollout/rollback mechanism. These are pending acceptance criteria, not checks that this demo has already passed.

Modern's application APIs can also serve a future HTTP Service App adapter: the producer service would execute `renderApplication`, while the host receives an agreed stream protocol over HTTP. Browser entry/assets, instance snapshots, cancellation, and hydration still need explicit integration. The current PR has no HTTP service executor or HTTP-to-local retry chain. Reusing application rendering and framing is a design direction, not an implemented Service App feature.
