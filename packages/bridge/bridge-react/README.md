# React Bridge

React bridge is used to load the routing module in mf, so that the routing module can work properly with the host environment.

> When to use

- Load the route module
- Load across the front end framework

## How to use

# 1. Install the react bridge library

```bash
pnpm add @module-federation/bridge-react
```

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

# 4. Hot-Module Replacement (HMR) for remote Bridge components

`createBridgeComponent` ships a **built-in HMR runtime** (`v2.8.2+`) that
automatically keeps the remote DOM in sync with your source edits on the
Remote side — no full page reload, no lost Host state, no manual registry code.

## Required configuration: `rootComponentGetter`

The runtime cannot guess at runtime which Rspack module id corresponds to your
user-land `App` source file. Tell it how to re-read the latest value by adding
the single-line `rootComponentGetter` option alongside `rootComponent`.

> **Internal mechanics** of the HMR runtime (global caller-key map, live bridge
> registry, Rspack `rspackHotUpdate*` monkey-patch and the reconciliation
> trigger) are intentionally kept out of this README — see
> [`docs/hmr-internals.md`](./docs/hmr-internals.md) for the in-depth design
> walkthrough, the reference Babel/SWC plugin for zero-boilerplate injection
> and how to integrate it with Modern.js / Rspack presets for a literally
> zero-code developer experience.

### ✅ Default import pattern (recommended)

```tsx
// ./src/export-app.tsx
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import App from './App';

export default createBridgeComponent({
  rootComponent: App,
  // ↓ Add this one line for HMR correctness.
  rootComponentGetter: () => (require as any)('./App').default,
});
```

### ✅ Named import pattern

```tsx
import { RemoteShell } from './components/RemoteShell';

export default createBridgeComponent({
  rootComponent: RemoteShell,
  rootComponentGetter: () =>
    (require as any)('./components/RemoteShell').RemoteShell,
});
```

### ✅ Tsconfig path aliases (`@/App`, `@components/X`)

Keep the alias string verbatim inside the getter — Rspack/Webpack resolve it at
runtime the same way they resolve the top-level `import`:

```ts
import App from '@/App';

export default createBridgeComponent({
  rootComponent: App,
  rootComponentGetter: () => (require as any)('@/App').default, // works
});
```

### ❓ Do I have to add the getter?

| Scenario | Without getter | With getter |
|---|---|---|
| Change the **exporter file itself** (`export-app.tsx`: add route, rename options) | ✅ HMR works (the file is re-evaluated top-level) | ✅ HMR works |
| Change **`App.tsx` / children / deep imports** (99 % of local edits) | ⚠️ DOM stays stale (no visual update, but no full reload) | ✅ Live refresh in ~ 4-8 s |
| Production bundle behavior | Identical | Identical (zero runtime cost when getter is never called) |

Conclusion: the getter is **dev-only** instrumentation. You can safely omit it in
projects that do not rely on HMR for React component edits — it has zero
impact on the production bundle or SSR render path.

> Want to remove even this single-line `rootComponentGetter` from your
> application code and let the framework inject it at compile time?
> See the zero-boilerplate integration guide, Babel plugin reference and
> Modern.js wiring in
> [`docs/hmr-internals.md`](./docs/hmr-internals.md).
