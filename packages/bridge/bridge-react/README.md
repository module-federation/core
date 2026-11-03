# React Bridge

React bridge is used to load the routing module in mf, so that the routing module can work properly with the host environment.

> When to use

- Load the route module
- Load across the front end framework

## How to use

# 1. Install the react bridge library

```bash
pnpm add @module-federation/bridge-react @module-federation/enhanced
```

Import runtime APIs and types from `@module-federation/enhanced/runtime`. Use an Enhanced version satisfying Bridge’s peer dependency range. Bridge uses the same entry for its runtime helpers and instance extensions, so applications do not need direct dependencies on `@module-federation/runtime` or `@module-federation/runtime-core`.

# 2. Configure the react bridge library

> Use createBridgeComponent create component provider

```jsx
// ./src/index.tsx
import { createBridgeComponent } from '@module-federation/bridge-react';

function App() {
  return ( <BrowserRouter basename="/">
    <Routes>
      <Route path="/" Component={()=> <div>Home page</div>}>
      <Route path="/detail" Component={()=> <div>Detail page</div>}>
    </Routes>
  </BrowserRouter>)
}

export default createBridgeComponent({
  rootComponent: App
});
```

> Legacy Router wrapper setup. Framework adapters can use the router-free `/base` entry and the shared connector described below without a Router alias.

```js
//rsbuild.config.ts
export default defineConfig({
  source: {
    alias: {
      'react-router-dom$': path.resolve(
        __dirname,
        'node_modules/@module-federation/bridge-react/dist/router.es.js',
      ),
    },
  },
  server: {
    port: 2001,
    host: 'localhost',
  },
  dev: {
    assetPrefix: 'http://localhost:2001',
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      delete config.optimization?.splitChunks;
      config.output!.uniqueName = 'remote1';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote1',
          exposes: {
            './export-app': './src/index.tsx',
          }
        }),
      ]);
    },
  },
});
```

# 3. Load the module with routing

```js
//rsbuild.config.ts
export default defineConfig({
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output!.uniqueName = 'host';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            remote1: 'remote1@http://localhost:2001/mf-manifest.json',
          },
        }),
      ]);
    },
  },
});
```

> Use the module

```jsx
// ./src/index.tsx
import { createReactRemote } from '@module-federation/bridge-react';

const Remote1 = createReactRemote({ remote: 'remote1/export-app' });

function App() {
  return ( <BrowserRouter basename="/">
    <ul>
      <li>
        <Link to="/">
          Home
        </Link>
      </li>
      <li>
        <Link to="/remote1">
          Remote1
        </Link>
      </li>
    </ul>
    <Routes>
      <Route path="/" Component={()=> <div>Home page</div>}>
      <Route path="/remote1" Component={()=> <Remote1 />}>
    </Routes>
  </BrowserRouter>)
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App />
);
```

## Unified React remote consumers

`createReactRemote` and `ReactRemote` are available from the root and router-free
`/base` entries. They read the selected expose's rendering protocol from the
Snapshot returned by the completed runtime `afterResolve` chain before choosing
the consumer. This includes platform-provided snapshots and request rewrites.
String inputs select the protocol before executing the expose. The same resolved
request continues through the normal load lifecycle without resolving or fetching
its manifest again. Callback inputs execute once per consumer attempt, then use
the completed load's recorded source and Snapshot to select the consumer.

```tsx
import { createReactRemote, ReactRemote } from '@module-federation/bridge-react/base'

const Card = createReactRemote<{ label: string }>({
  remote: 'shop/Card',
  loading: <span>Loading</span>,
  fallback: ({ error, retry }) => <button onClick={retry}>{error.message}</button>,
})

<Card label="Example" />
<ReactRemote remote="shop/Card" props={{ label: 'Example' }} />
```

Pass `instance` when consuming through a particular Enhanced runtime. The default
instance is resolved at render time. Ordinary components, including named exports
selected with `exportName`, render in the host React tree and retain the existing
component SSR, stylesheet and data-loader integration. `noSSR` keeps the server
placeholder for hydration, then prepares the protocol, component and data from
the first client effect. Ready content commits without an intermediate mount
gate or a second loading effect. Configured load and data fallbacks
remain present in server HTML. Resolution failures also reach the runtime
load-recovery and diagnostic hooks before the consumer fallback.

An expose marked `render: 'bridge'` owns a separate application Root. With a Host
SSR adapter and a provider exposing `renderStream`, the unified consumer streams
the application and hydrates that Root independently in the browser. The same
provider instance then handles props updates, navigation, and cleanup. See
[Bridge application SSR](#bridge-application-ssr) for the producer and Host
contracts. Service App execution is outside this API.

Without the Host SSR context, Bridge keeps its server placeholder. String inputs
then avoid loading the producer's Node expose. Under that context, Bridge loads
the Node expose to check its `renderStream` capability. A provider without that
method keeps its existing CSR behavior. Function inputs may execute the module
before its protocol can be identified. Use `noSSR` for an expose that must only
execute in the browser.

For an unmarked legacy provider, set `render: 'bridge'`. A hint conflicting with
published metadata fails. Unmarked ordinary components keep the component path.
The same `remote` option also accepts synchronous or asynchronous callbacks:

```tsx
import Shop from 'shop/Card';
import { loadRemote } from '@module-federation/enhanced/runtime';

const LoadedCard = createReactRemote({ remote: () => loadRemote('shop/Card') });
const PreloadedCard = createReactRemote({ remote: () => Shop });
// A callback can also return a preloaded namespace, or Promise.resolve(Shop).
```

Callbacks return an MF namespace or a preloaded default component/provider. The
consumer uses the exact loaded value. Function components, `memo`, `forwardRef`,
and frozen namespaces are supported without invoking components to identify them
or modifying the raw `loadRemote` result. Ordinary components retain SSR content,
data fetching, and assets. `noSSR` does not invoke the callback on the server.
A static import or preload performed by application code still runs when that
application code executes.

Keep function inputs to `ReactRemote` stable across renders by defining them at
module scope or using `useCallback`. Reuse the same function when only business
props change. Replacing the function reference selects a new loading source and
resets that consumer instance's loading and component state.

Preloaded default exports require the updated runtime that records provenance
when the remote factory executes, including bundler-managed imports. Load and
consume the value through the same runtime instance. Older runtimes can still
return a namespace carrying `mf_module_id`, with an extra metadata resolution.
A local component without MF provenance, an unassociated accessor export, or one
value reused by multiple exposes or deployments cannot be identified reliably.
Use a string input or an unambiguous namespace in those cases. Multiple names for
one export within the same expose are allowed. Default interop getters may be
read to record provenance, while arbitrary named getters are not evaluated.
A named component selected from a namespace still uses `exportName`. A callback
returning an individual export treats that value as the default export.

Business props are inferred from callback results, namespace default or named
component exports, and generated remote ID declarations. Generated host types
extend the shared `ModuleFederation.RemoteModuleMap` interface. Applications can
also augment that interface for a typed remote ID without generated declarations.
Unknown dynamic strings can still use `createReactRemote<Props>` explicitly.

Loading defaults to null. Without `fallback`, errors reach the parent boundary.
Retry creates fresh failed-load and consumer state, without promising a network
re-download or automatic replay of business loaders. General runtime registration
and loading APIs remain available from `@module-federation/enhanced/runtime`.

### Application routing controls

Unified and legacy consumers use the same Bridge renderer. The unified API
selects the component or Bridge protocol, while the shared renderer owns provider
creation, updates, cleanup, and asynchronous failures. Updating business props or
navigating within a mount reuses the mounted provider and React Root.
The shared renderer removes its loading placeholder in a React commit before
allowing the producer Root to render into the same mount container.

The default entry retains the existing React Router integration for both
`createRemoteAppComponent` and `createReactRemote` / `ReactRemote`. It reads the
local route boundary to calculate `basename` and notifies browser-based Remotes
when the Host pathname, query, or hash changes. An explicit basename overrides
inference while retaining Host notifications. Existing Router aliases and
producer Router wrappers remain available for that legacy integration.

This automatic path provides Host-to-Remote notifications for browser-based
Bridge producers. It does not observe every producer Router or make independent
memory navigation follow the Host. Framework application Roots must connect
their Router to the Bridge integration to provide both directions.

Framework integrations should use `/base`, which has no React Router dependency.
The framework reads its own Router context, calculates the mount basename, and
passes `basename` and an optional `navigation` adapter to Bridge. This integration
does not require replacing the framework Router through build aliases. Explicit
adapters and `memoryRoute` mounts bypass the default entry's automatic Host
notifications.

The unified consumers accept these controls separately from business `props`.
The legacy `createRemoteAppComponent` factory accepts the same controls in its
options. Existing basename and memoryRoute instance props remain supported.
Navigation controls use internal Bridge metadata, so an application prop named
`navigation` keeps its business meaning and is not consumed as a Router adapter.
Older providers retain flat basename and memoryRoute controls and can ignore the
optional navigation integration.

`basename` is owned by the consumer and describes where the application is
mounted. A framework's source route selector chooses exported content, not a
producer basename. For example, selecting the application under `/product` and
mounting it at `/inventory` exposes its relative detail route at
`/inventory/detail/42`. Producers remain responsible for portable relative links,
navigation, and code that depends on a fixed basename or absolute URL. Core does
not interpret framework route selectors. Browser-connected framework applications
keep that basename fixed for one mount. If its actual mount basename changes,
the framework consumer must create a new mount identity, for example with a React
key, and dispose the previous Root, Router, subscriptions, and pending requests.
Page state is preserved for ordinary props updates and internal navigation, but
not across different mount locations.

Framework application Roots can call `useBridgeRouter()` from `/base` to read
their provider's mount context. A navigation adapter supplies `getLocation()`,
`subscribe(listener)`, and `navigate(to, { replace })`. An optional `createHref(to)`
formats native links for Hash Routers. Locations include the Host Router basename,
query, and hash. Numeric navigation is available through the Host adapter. Each
adapter subscription belongs to a mounted application and must be released on
unmount. Passing an adapter alone does not retrofit an older provider's Router.
The framework's application Root must consume the integration.

Frameworks connecting a browser-backed Router can use
`createBridgeRouterConnector` from `/base` (also exported by the default, `/v18`,
and `/v19` entries). It delegates to the Router-independent implementation in
`@module-federation/bridge-shared`. Create one connector in the mounted
application's committed lifecycle, attach its Router adapter, and dispose it
when that application unmounts:

```ts
const connection = createBridgeRouterConnector({
  navigation: bridge.navigation,
  onError: reportRouterError,
});
connection.attach(routerAdapter);
// Rebind a changed navigation adapter during the same mount.
connection.setNavigation(bridge.navigation);
// During unmount, also dispose the framework's Router.
connection.dispose();
```

The adapter supplies `getSnapshot`, `subscribe`, `getHistoryLocation`,
`syncFromHistory`, and `notifyPeers`. Snapshots include the committed URL and
entry key, the pending navigation's URL and key, the history action, and whether
initialization has completed. Use the Router's entry keys consistently for
history and snapshots. Entry keys are required so a same-URL new navigation can
be distinguished from a notification about an existing entry. Pending navigation
does not include background revalidation. `getHistoryLocation()` returns one
`{ url, key }` entry. Both history and snapshots use the full logical URL,
including the consumer basename, query, and hash. The connector does not project
between old and new mount prefixes.

`syncFromHistory` starts reading the current history entry without writing it
again. `notifyPeers` reports a write already completed by the Remote, for example
using the existing browser `popstate` compatibility notification. The adapter
must exclude the writing Router from that notification, including when it has
started a subsequent navigation. Other Router instances still receive it. The
framework adapter owns Browser/Hash interpretation and Router-specific APIs. The connector
owns initial redirect reconciliation, duplicate pending-entry detection, and
subscription cleanup. Work is queued rather than performed synchronously while
attaching a Router. Disposing the connector invalidates queued work.

The connector uses the existing per-mount `navigation` reference. It does not
register a global runtime plugin or use `afterBridgeRouteSync` for communication.
That hook retains its existing observation behavior and does not acknowledge that
a Router's loaders have completed. Older providers keep their existing routing
behavior, and independent `memoryRoute` cards do not attach a browser connector.

`memoryRoute` preserves the existing Bridge option for independent navigation
with an initial `entryPath`. Existing Router wrappers use it to select a memory
Router instead of browser history. It does not select a producer route scope.

No routing metadata is added to manifests or Snapshots. These routing controls do
not select an SSR implementation, execute a service, or replace a remote version.

## Bridge application SSR

Bridge SSR combines a Host React stream with independently rendered Bridge
applications. The HTTP response contains the producer's rendered HTML and data
inside ordered script envelopes. A small browser receiver inserts that HTML into
the matching container before the producer hydrates it. JavaScript is required
for this delivery format. A successful CSR recovery is not evidence that SSR or
DOM reuse succeeded.

The receiver replays inline classic scripts once and preserves application script
elements for hydration. It removes only identified React transport instructions.
External and module scripts inside remote HTML are outside this stream contract.

The unified consumers choose a renderer and reuse the shared Bridge lifecycle.
Framework adapters supply application rendering, route and loader restoration,
and Host stream hooks. They do not need another consumer implementation or shared
React Router aliases. This SSR path is enabled through `createReactRemote` and
`ReactRemote`. The legacy consumer factories keep their existing CSR behavior.

### Package entries

| Entry          | Purpose                                                                              |
| -------------- | ------------------------------------------------------------------------------------ |
| `/base`        | Router-free unified consumers and Bridge routing helpers                             |
| `/v18`, `/v19` | Browser producer factories with the matching React Root and hydration implementation |
| `/server`      | Producer factory for a Node artifact, without importing `react-dom/client`           |
| `/ssr`         | `BridgeSSRContext` and shared request, result, and hydration types                   |
| `/ssr-node`    | `createBridgeSSRController` and producer stream normalization for Node Host adapters |

Keep `/server` and `/ssr-node` out of browser bundles. The ordinary browser
entries do not import their Node stream, HTML parser, or JavaScript parser code.
The Host adapter and its consumers must resolve the same `BridgeSSRContext`
module instance. A framework that installs more than one physical copy of Bridge
must preserve that context identity in its Node build.

### Producer callbacks

`createBridgeComponent` still returns a provider factory with inferred business
props. The optional `render`, `hydrate`, and `renderStream` callbacks let a
framework use its existing application runtime. All three receive the same
Bridge-wrapped React element. Their `info.rootComponent` is the original local
component passed to the factory, so an adapter can find its application
definition. That component reference is not serialized.

| Callback                        | Contract                                                                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render(App, container, info)`  | Create or update the application. Return its existing Root for later updates and unmounting.                                                                                                                                            |
| `hydrate(App, container, info)` | Restore `info.snapshot` and optional `info.updates`, then hydrate the existing DOM with `info.rootOptions`. Return the Root that later updates reuse.                                                                                   |
| `renderStream(App, info)`       | Render on the server. Receive the request URL, headers, nonce, abort signal, instance ID, identifier prefix, consumer basename, optional memory route, and business props. Return the HTML stream, snapshot, and cancellation function. |

A minimal producer with no framework loader data can export these Node and
browser artifacts for the same expose:

```tsx
// app.node.tsx
import { PassThrough, Readable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createBridgeComponent } from '@module-federation/bridge-react/server';
import { App } from './App';

export default createBridgeComponent({
  rootComponent: App,
  async renderStream(element, info) {
    const output = new PassThrough();
    const root = renderToPipeableStream(element, {
      identifierPrefix: info.identifierPrefix,
      nonce: info.nonce,
      onShellReady() {
        root.pipe(output);
      },
      onShellError(error) {
        output.destroy(error instanceof Error ? error : new Error(String(error)));
      },
    });
    return {
      stream: Readable.toWeb(output) as ReadableStream<Uint8Array>,
      snapshot: Promise.resolve(null),
      abort: root.abort,
    };
  },
});
```

```tsx
// app.browser.tsx
import { createBridgeComponent } from '@module-federation/bridge-react/v19';
import { App } from './App';

export default createBridgeComponent({ rootComponent: App });
```

The framework's build integration selects the Node artifact for server loading
and the browser artifact for browser loading. An existing generic factory with
`renderStream` can also return a raw result: the Host normalizes it using the
same stream implementation. Do not serialize the React element or replace it
with a separately constructed tree in a renderer callback.

The producer-to-consumer message contract uses `module-federation/bridge-ssr/producer/v1`. The Host's inline browser receiver and response frames are generated together and do not carry a separate protocol identifier.

`BridgeSSRResult` contains a byte `ReadableStream`, a final `snapshot` promise,
and `abort(reason)`. Optional `stylesheets` describe CSS required by the
application. Without progressive hydration metadata, hydration waits for the
complete HTML and snapshot. For progressive hydration, return `hydration` with
the shell's `snapshot` promise, an ordered `updates` stream, and a `shellMarker`
matching a `<template>` ID in the HTML stream. The receiver can then start hydration
after the shell and initial data arrive while remaining HTML and updates stream
in. The framework owns serializable snapshot contents, deferred-data restoration,
and update handling. Business props are passed to the renderer unchanged.

### Host adapter

Create one controller per SSR request and provide its context around the Host
React tree. A framework integration wires these operations into its existing
SSR pipeline:

```tsx
import { BridgeSSRContext } from '@module-federation/bridge-react/ssr';
import { createBridgeSSRController } from '@module-federation/bridge-react/ssr-node';

const identifierPrefix = 'host-';
const shellEndMarker = '<template id="bridge-host-shell"></template>';
const bridge = createBridgeSSRController({
  request,
  nonce,
  identifierPrefix,
  shellEndMarker,
  timeoutMs: 30_000,
  onError(error, instanceId) {
    // Use the framework's request logger. The browser receives a generic error.
    logger.error({ error, instanceId });
  },
});

const tree = (
  <BridgeSSRContext.Provider value={bridge.context}>
    <HostApp />
    <template id="bridge-host-shell" />
  </BridgeSSRContext.Provider>
);

// Render `tree` with the same identifierPrefix used by Host browser hydration.
// Inject bridge.getBootstrap() into the document before any Bridge frames.
// Pass the raw Host React Readable through bridge.processStream(rawHostStream).
// Apply the framework's document template to that composed output.
// Call bridge.abort(reason) when the framework cancels the response.
```

`getBootstrap()` returns HTML containing the receiver script and any stylesheets
known at that point. Styles discovered later travel with their application's
metadata. `processStream()` accepts the raw Host React stream before document
templating, including the exact shell marker. It preserves the Host shell before
emitting remote envelopes and keeps the response open until its registered jobs
finish, even if the Host React stream has ended. Request cancellation and a closed
response abort outstanding work. `timeoutMs` defaults to 30 seconds and bounds
preparation and rendering. `onError(error, instanceId)` reports original selected
Bridge rendering failures on the server without exposing their details in HTML.

The consumer reserves a request task before resolving a remote or invoking its
loader. The reservation's `wait` applies the deadline while the remote type is
unknown. A selected Bridge provider with `renderStream` activates the task once
its mount inputs are known. An ordinary component or CSR-only provider releases
it without creating a browser session. Thus all three inputs support Bridge SSR:
`'shop/Product'`, `() => loadRemote('shop/Product')`, and `() => Shop` where `Shop`
is an MF export already loaded through the same runtime. They keep the type
inference and provenance requirements described above. Function inputs are not
automatically treated as client-only.

The browser receiver can queue output before a remote container arrives. A
container marked by the server also waits for metadata that arrives after Host
hydration. Each mounted consumer claims one session and hydrates its actual
server DOM with the producer's identifier prefix and restored data. Independent
instances do not wait for another application's stream to complete. Ordinary
props updates and navigation reuse the hydrated provider, Root, Router, and page
state. Unmounting releases the session, cancels pending work, and destroys that
provider. A changed basename requires a new mount, as described above.

A server-marked Bridge container selects the existing Bridge renderer immediately
while its browser provider loads. The Host can hydrate the mount container without
suspending on module classification. Pending business props updates then pass
through the same provider after its initial hydration, preserving the server DOM.

Stream failures, timeout, or a claimed hydration failure request a document
reload with `csr=1`. The Host adapter must honor that parameter by rendering its
CSR document. Recovery must not rerun the broken SSR response indefinitely.
Preparation failures before Bridge activation continue through the ordinary
consumer error and retry path. `noSSR` skips server loading and preserves the
loading placeholder for client preparation. It also avoids a Bridge SSR task.

### Framework and version boundaries

Modern's initial integration validation uses React **19.3.1**. Core's generic
stream engine, provider callbacks, and DOM hydration tests also run with React
**18.3.1**, but that does not establish equivalent Modern SSR support.

Unpatched React 18.3.1 `renderToPipeableStream` has a confirmed UTF-8 buffer-boundary
defect: it can insert NUL bytes and corrupt Unicode attributes after HTML parsing.
Both development and production builds reproduce the defect through this
normalizer and browser receiver. Correct visible text alone does not prove the
response bytes or attributes are intact. The older experimental patch backports
the buffer-length correction in [React #26228](https://github.com/facebook/react/pull/26228),
with the React 18.3.1 report tracked in [React #31134](https://github.com/facebook/react/issues/31134).
This implementation does not apply that dependency patch or strip bytes from the
transport. React 18.3.1 Node Pipeable rendering is therefore outside the initial
Modern SSR support boundary. Older React consumer versions without `useId` retain
the existing CSR Bridge path.

Browser routing remains the default for exported browser applications. Existing
Hash configuration is preserved, and only explicit `memoryRoute` opts into
independent memory navigation. Server adapters derive their initial route from
the request and restore that route and its loader data for hydration. A URL
fragment is absent from the HTTP request, so arbitrary initial Hash deep-link
SSR is not established by the Browser SSR validation. A framework route selector
chooses exported content: selecting `/product` and mounting at `/inventory`
still gives `/inventory/detail/42`, without restoring the source prefix. Relative
business links and producer data endpoint configuration remain application and
data-layer responsibilities.

The Node `/server` producer implements stream rendering without importing the browser Root lifecycle. Browser `/v18` and `/v19` producers implement mount, hydration, updates and unmount without including Node stream processing. Their shared tree construction keeps the server and browser markup consistent. Producer messages carry data snapshots in their `data` or `ready` messages, without a duplicate top-level snapshot promise.

The default and `/base` consumption entries select a Node implementation through the `node` export condition. Their browser implementations keep DOM ownership and independent hydration, while Node implementations reserve SSR jobs and render mount containers without importing that browser lifecycle. Both delegate source loading and renderer selection to the same shared consumer. Explicit browser producer entries remain `/v18` and `/v19`, and the Node producer entry remains `/server`.

## Maintainer bundle-size reports

The existing Bundle Size workflow compares the PR head with its Git merge-base,
using the head's measurement fixtures and toolchain for both builds. Existing
browser provider entries have before/after deltas. SSR-only exports absent from
the base are reported as new capabilities with absolute sizes, never as a zero
baseline. Non-peer runtime dependencies are bundled, while declared peers and
Node builtins remain external. Bundle fixtures emit ESM. The receiver's response HTML is measured separately
from JavaScript bundles. Size measurements do not establish runtime performance.

After building both revisions, the Bridge section can also be reproduced locally
from the current checkout:

```sh
node scripts/bundle-size-report.mjs --bridge-only --output head.json
node scripts/bundle-size-report.mjs --bridge-only --packages-dir /path/to/base/packages --output base.json
node scripts/bundle-size-report.mjs --bridge-only --compare base.json --current head.json --output stats.txt
```

CI displays the comparison in the job summary and existing PR report, and uploads
both JSON measurements with the Markdown report. The JSON records source SHAs,
lockfile hashes, tool versions, build settings, resolved modules and external
imports. Git retains the inputs needed to rebuild each revision, while report
artifacts are retained according to the repository's Actions retention policy.
