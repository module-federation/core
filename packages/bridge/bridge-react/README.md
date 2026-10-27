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
The same resolved request continues through the normal load lifecycle without
resolving or fetching its manifest again.

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
outputs a placeholder without loading the producer's Node expose. Bridge SSR and
Service App execution are not supported by this API version.

For an unmarked legacy provider, set `render: 'bridge'`. A hint conflicting with
published metadata fails. Unmarked ordinary components keep the component path.
CSR loaders may be used as `remote` if they return an MF module namespace with a
module identity. Use an alias/expose string for automatic SSR selection.

Loading defaults to null. Without `fallback`, errors reach the parent boundary.
Retry creates fresh failed-load and consumer state, without promising a network
re-download or automatic replay of business loaders. General runtime registration
and loading APIs remain available from `@module-federation/enhanced/runtime`.
