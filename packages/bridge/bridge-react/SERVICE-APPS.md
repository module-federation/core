# Service Apps

A Service App runs application SSR and initial data access in its producer HTTP service. The browser loads its real Bridge provider and restores that same application's Root, router and data. Host components continue using `createReactRemote` or `ReactRemote` with a function remote. Props crossing HTTP must be JSON serializable.

## Capabilities and deployment

Export `createBridgeComponent({ rootComponent, isService: true, render, hydrate, renderStream })`. A framework helper can supply the three callbacks. Static analysis carries `render: 'bridge'` and `isService: true` through the manifest and Snapshot for that expose. A mixed remote's other exposes retain their existing behavior.

Addresses belong to deployment configuration. Register `bridgeServicePlugin` from `@module-federation/bridge-react/service-node` in the Node runtime, with bindings keyed by module ID:

```ts
bridgeServicePlugin({
  'weather/App': {
    url: 'http://weather-service/services/render',
    timeoutMs: 15000,
    forwardHeaders: ['accept-language'],
    serviceHeaders: { authorization: serviceCredential }
  }
})
```

Install private bindings from the server bootstrap. Do not serialize upstream URLs or credentials into bundler runtime-plugin arguments, because Node SSR bundles may also be downloadable. A framework adapter can carry only a runtime identity in the bundle and resolve its private bindings from server-owned process configuration. Only Node receives upstream URLs and service credentials. Register the browser plugin from `@module-federation/bridge-react/service` with same-origin ingress URLs and optional timeouts. Framework adapters should generate these public bindings from the private deployment configuration.

The Node plugin examines the current expose after manifest resolution, then supplies a lightweight factory through runtime-core's `beforeLoadRemote` hook. It neither fetches SSR output during module loading nor loads the Node container. Ordinary exposes still load the real entry. Both paths share factory execution hooks, `onLoad`, `afterLoadRemote`, namespace/default behavior, deferred bundler factories and provenance. No virtual container or error recovery represents a successful Service load.

Default Node asset preloading remains empty. Use loaded-first sharing, as Modern does, to avoid eager container discovery. The Service plugin rejects explicit version-first configuration, including per-share strategies, with a diagnostic because eager container discovery precedes expose selection.

## HTTP producer

`createBridgeServiceHandler` from `/service-node` adapts a Web Request to a Response. Bind one actual producer renderer and its manifest build identity:

```ts
const handler = createBridgeServiceHandler({
  buildVersion: deploymentBuildVersion,
  authorize: authenticateEveryRequest,
  cache: { maxAgeMs: 60000 },
  render: info => producer.renderStream(info)
})
```

`authorize` executes before every cache lookup. `validate` optionally checks deployment-specific module and page constraints. A framework adapter loads the producer's real Node expose and supplies its existing manifest build identity. Configure a unique `MF_BUILD_VERSION` once for each paired browser/Node build. Core otherwise falls back to package version, which does not distinguish rebuilding the same package version. Deploy the manifest, provider artifacts and service together. A mismatched expected build returns 409 before rendering. Unsupported protocol or response build metadata fails consumption.

The wire protocol remains `module-federation/bridge-ssr/producer/v1`. The first NDJSON message is `meta` with build identity, identifier prefix, hydration mode and CSS URLs, followed by the producer's complete `html`, `ready`, `update` and `done` messages. Generic complete providers retain their existing `data` mode. Modern only uses initial snapshots plus updates.

The producer alone frames HTML, isolates React scripts and determines readiness. React 19.2+ independent streams use its native queued Suspense marker so document completion does not abandon pending boundaries. React 18 output stays unchanged. Consumers decode and validate JSON messages without reparsing producer HTML. A JSON newline is the record separator, while newlines inside HTML remain escaped JSON content.

`fetchBridgeService(info, binding)` keeps its timeout active until validated EOF after done. The default timeout is 30 seconds. Unmounting and request aborts cancel HTTP reading and producer rendering. No local fallback is provided. Before or after metadata failure, the existing Bridge recovery policy applies, and explicit `csr=1` recovery bypasses Service requests.

## CSR mounts

The Host keeps the Service container empty from its first render and displays loading beside it. After commit it creates an independent receive session, requests the same-origin ingress and creates the browser provider. HTTP reading and waiting for hydration readiness run independently.

The existing receiver manages CSS, HTML insertion, initial snapshot, updates and completion. The existing `hydrateRemoteRoot` calls hydrate once when initial content and resources are ready. Reading continues for slow regions. Props updates, navigation and destroy retain the existing provider lifecycle. An initial SSR session is claimed rather than requested again. `noSSR` renders directly in the browser. A released session cannot deliver into a new mount.

The same-origin ingress must select upstreams from trusted configuration and validate source origin, module, page URL and bounded parameters. Forwarded business headers and upstream authentication are separate. A static Host still needs this service or gateway. Nested application status, redirects and response headers do not automatically replace the Host response.

## Result cache and limits

Caching is disabled by default. `cache.maxAgeMs` is required when enabled and starts at successful completion. Defaults are 128 entries, 32 MiB retained transcripts and min(1 MiB, maxBytes) per entry. Entries expire without extending on access and capacity uses LRU eviction. Exceeding one entry's limit stops recording while live rendering continues.

The exact serialized request is the cache key, including build identity, module, URL, basename, props, user headers, instance identity, React prefix and nonce. Hits skip the renderer, loader and producer stream processing. The handler retains complete successful message sequences, including progressive ready and updates. This does not require a final snapshot. Failed, cancelled, truncated or illegal sequences are not saved. Replays have independent bytes and cancellation.

Responses use `Cache-Control: no-store`. That HTTP behavior is independent of the internal result cache. Cache hits do not replay the original data delays. Every-request authentication must precede the cache, and valid input or nonce must not be removed to manufacture hits.

Default limits are 3 MiB per serialized HTTP message and request body, 2 MiB per producer HTML frame and 4 MiB for each pending producer/transport queue. CSS/receiver readiness also retains the existing receiver budget and watchdog. These are individual queue and retained-record budgets, excluding React, parsing, socket buffers and concurrent requests. They are not a process-memory bound or full end-to-end backpressure. There is no request coalescing, distributed storage or proactive invalidation.

## Migration

Existing local Bridge providers and ordinary components need no Service configuration. Earlier experiments using dedicated loaders, manual module IDs, separate Service/browser protocols, hand-filled revisions or complete-snapshot Modern CSR recovery should migrate to function remotes, expose metadata, deployment bindings and progressive hydration. Do not merge the older framework-specific Service engine alongside this implementation.
