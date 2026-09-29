# @module-federation/modern-js-v3

This plugin integrates Module Federation with Modern.js. See the [Modern.js integration documentation](https://module-federation.io/guide/framework/modernjs.html) for general configuration.

## Consolidated review and built-in integration follow-up

The complete framework work is reviewed in two PRs: [MF #5164](https://github.com/module-federation/core/pull/5164) and [Modern #8941](https://github.com/web-infra-dev/modern.js/pull/8941). MF #5164 includes the independent-root SSR and lifecycle work previously reviewed in #5112, progressive hydration from #5162, and Service HTTP execution. Modern #8941 includes the application APIs and commerce demo from Modern #8926 plus deferred-data hydration. The older PRs are superseded review history, not additional prerequisites.

Both consolidated PRs are held as drafts for the upcoming Modern built-in MF integration. The current implementation still uses `@module-federation/modern-js-v3`; the package migration below has not been implemented:

- Modern will declare `@module-federation/enhanced` as a peer in each published package that imports it, and obtain MF APIs from `@module-federation/enhanced/runtime`.
- Framework-independent Bridge loaders, lifecycle/SSR contracts, framing and transport can live in Bridge. Modern application adapters, registry/expose generation and `extendStreamSSR` integration belong in Modern, with dedicated `@modern-js/runtime/mf` and server exports.
- Preserve Node/browser entry selection, lazy local loading for HTTP-only hosts, runtime instance/Bridge plugin identity, and explicit Bridge/Node-support dependencies. The current legacy `@modern-js/runtime/mf` alias must be replaced as part of that migration.

Review the shared Bridge components and server/browser lifecycle first, then the Modern application APIs, progressive data contract, and finally the HTTP executor/protocol. The commerce example and its verification history live in the companion Modern PR at `examples/module-federation/bridge-ssr`. The separate Service App demo is retained in `code.byted.org/zhanghang.heal/mf-sdc`, branch `feat/bridge-progressive-service-ssr`; its React 18 pnpm patch, Node-artifact guard, README and VERIFICATION.md are validation material, not files included in these two framework PRs.

This consolidation merges the missing documentation history and updates its conclusions. It does not change runtime code, merge either PR into main, or publish packages. Existing build/browser evidence remains historical; consolidation checks verify ancestry, Markdown formatting, whitespace and that only Markdown differs from the previously validated tips.

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

The producer owns its Modern application definition, loaders, runtime context, and React renderer. At build time, `bridge.exposes` generates two entries that import the producer's registry: the Node entry exports `createModernServerBridge({ renderApplication })`, and the browser entry exports `createModernBrowserBridge({ createApplication })`. The build generates these calls; it does not execute SSR. Automatic detection of application exports in ordinary `config.exposes` is not implemented.

`renderApplication(request, options)` returns an HTML `stream`, a final `snapshot` promise, and `cancel`. Progressive mode additionally returns `hydration.snapshot`, `hydration.updates`, and `hydration.shellMarker`. It reuses Modern's request preparation and loaders but renders application content without the outer document template. `createApplication()` provides browser `mount`, `hydrate`, `update`, and `destroy`. The snapshot contains serializable initial state (including props, URL, basename, identifier prefix, initial data, and route loader data/errors), not the complete runtime context or React component state. MF transports it as opaque data; the producer's browser runtime consumes it. Consumer prop/URL changes reach `update` through subsequent Bridge `render` calls on the existing instance.

On the host, `createRemoteAppComponent` derives an instance ID from host `useId` and pre-registers work before the lazy module settles, using `deferRender: true`. The server lifecycle in `RemoteAppWrapper` later activates the same job with final routing parameters. `bridgeStreamPlugin` supplies `BridgeSSRContext` and a separate job map for each request through Modern's `api.extendStreamSSR`; these are not global jobs shared across requests. Each job selects an executor: the local path loads the producer's Node module and calls `renderStream` in the host process; the HTTP path obtains the same result contract from the producer service. The HTTP-only path never invokes the deferred local provider.

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

In progressive mode, the producer encodes an initial snapshot with pending-value references. After its complete shell marker passes framing, the host emits `ready`; the browser waits for the container, CSS and browser module, then calls the producer's `hydrate` once. Later HTML and opaque `update` frames resolve deferred boundaries in that same root. `done` signals completed transport and does not call `hydrateRoot` again. Providers without a progressive channel use the complete path: the producer resolves the final snapshot after HTML completion and recursive data resolution, the host emits `data/done`, and the browser hydrates after its completion gate. An SSR instance does not race a separate CSR mount: lifecycle updates queue behind initialization. Without an SSR session, it uses ordinary CSR mounting.

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

Publish the producer's MF manifest and browser assets for browser hydration and CSR. For local execution, also make the Node SSR entry and all referenced chunks available to the host: its MF Node loader executes that build in the host process, without an additional server. For HTTP-only execution, deploy the Node build to the producer service instead; the host requests, frames, and forwards that service's rendered output without loading or executing the producer Node expose. Only an explicitly enabled local fallback adds that Node-artifact requirement to an HTTP consumer. Static artifact delivery may itself use HTTP; downloading code is separate from requesting an HTTP rendering service.

The default path is SSR. Loading, rendering, stream completion, and hydration failures trigger a single whole-page navigation that sets `csr=1` and preserves other query parameters and the URL hash. Enable Modern's `server.ssr.forceCSR` on the host so that the next request selects CSR; this plugin does not change that Modern setting automatically. In CSR mode, the browser mounts the producer applications through their normal browser entries. A missing browser artifact can still fail and is shown by the component's error fallback.

A received stream is not proof of success: the selected protocol must deliver the required snapshot/data updates and its completion frame, and deferred React boundary insertion must finish. Truncated or stalled streams fall back after the deadline. Once a partial SSR response has been delivered, failure uses the same whole-page CSR navigation.

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
