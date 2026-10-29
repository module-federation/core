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

> set alias to proxy

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
import { createBridgeComponent } from '@module-federation/bridge-react';

const Remote1 = createBridgeComponent(()=> import('remote1/export-app'));

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

An expose marked `render: 'bridge'` mounts its default provider in a separate
client root. Each mounted consumer owns its provider lifecycle. On the server it
outputs a placeholder and never invokes the provider. With a string input, the
producer's Node expose is not loaded. A callback may already execute that module
before its protocol can be identified. Bridge SSR and Service App execution are
not supported by this API version.

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
routing controls reuses the mounted provider and React Root.
The shared renderer removes its loading placeholder in a React commit before
allowing the producer Root to render into the same mount container.

The default entry retains the existing React Router integration for both
`createRemoteAppComponent` and `createReactRemote` / `ReactRemote`. It reads the
local route boundary to calculate `basename` and notifies browser-based Remotes
when the Host pathname, query, or hash changes. An explicit basename overrides
inference while retaining Host notifications. Existing Router aliases and
producer Router wrappers remain available for that legacy integration.

This automatic path applies to browser-based Bridge producers. A framework
application backed by an independent memory Router still needs its framework's
navigation integration. In particular, consuming a Modern application Root
through Core directly with only `basename` does not connect that memory Router
to the Host. Use the Modern consumer entry or provide the navigation adapter.

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
not interpret framework route selectors.

Framework application Roots can call `useBridgeRouter()` from `/base` to read
their provider's mount context. A navigation adapter supplies `getLocation()`,
`subscribe(listener)`, and `navigate(to, { replace })`. An optional `createHref(to)`
formats native links for Hash Routers. Locations include the Host Router basename,
query, and hash. Numeric navigation delegates history movement to the Host. Each
adapter subscription belongs to a mounted application and must be released on
unmount. Passing an adapter alone does not retrofit an older provider's Router.
The framework's application Root must consume the integration.

`memoryRoute` preserves the existing Bridge option for independent navigation
with an initial `entryPath`. Existing Router wrappers use it to select a memory
Router instead of browser history. It does not select a producer route scope.

No routing metadata is added to manifests or Snapshots. Bridge SSR, service
execution, and remote version replacement are outside these controls.
