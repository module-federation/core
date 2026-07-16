# Module Federation for Lynx

`@module-federation/lynx` adapts Rspack Module Federation to official Rspeedy
applications. It preserves normal federated imports, adds a Lynx transport for
manifest-addressed `.lynx.bundle` files, and isolates shared modules by Lynx
JavaScript realm.

The package requires a layers-capable Rspack build. The version verified by this
repository is `2.1.5-canary-54a0d8f3-20260715194831`. The bundle transport uses
`lynx.loadScript`, available in Lynx SDK 3.7 and later; `remoteBundle.engineVersion`
therefore defaults to `3.7`.

## Host

Register the adapter after the Lynx DSL plugin so it can use the official
`BACKGROUND` and `MAIN_THREAD` layers:

```ts
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginLynxModuleFederation } from '@module-federation/lynx';

export default defineConfig({
  plugins: [
    pluginReactLynx(),
    pluginLynxModuleFederation(
      {
        name: 'lynx_host',
        remotes: {
          catalog: 'catalog@https://example.test/mf-manifest.json',
        },
        shared: {
          'app-state': { singleton: true, realm: 'background' },
        },
      },
      {
        environment: 'lynx',
      },
    ),
  ],
});
```

Application code keeps the usual syntax:

```ts
const { default: Card } = await import('catalog/Card');
```

The same manifest works through the runtime API:

```ts
import { createInstance } from '@module-federation/runtime';
import lynxRuntimePlugin from '@module-federation/lynx/runtimePlugin';

const federation = createInstance({
  name: 'lynx_runtime_host',
  remotes: [
    {
      name: 'catalog',
      entry: 'https://example.test/mf-manifest.json',
    },
  ],
  plugins: [lynxRuntimePlugin()],
});

const Card = await federation.loadRemote('catalog/Card');
```

Use the Module Federation manifest URL, not the generated JavaScript container
URL. The adapter rewrites `metaData.remoteEntry` to the public
`.lynx.bundle`; the generated `.js` container is an internal encoder input.

## Remote bundles

Native remotes are background-only:

```ts
pluginLynxModuleFederation(
  {
    name: 'catalog',
    exposes: {
      './Card': './src/Card',
    },
    shared: {
      '@lynx-js/react': { singleton: true },
    },
  },
  {
    environment: 'lynx',
    remoteBundle: {
      target: 'lynx',
      filename: 'catalog.lynx.bundle',
    },
  },
);
```

Set `target: 'web'` and `mainThread: true` for a Lynx for Web remote that
supports both realms:

```ts
pluginLynxModuleFederation(federationOptions, {
  environment: 'web',
  mainThread: true,
  remoteBundle: {
    target: 'web',
    filename: 'catalog.web.lynx.bundle',
  },
});
```

### Chunking modes

`remoteBundle.chunking` controls deployment shape:

| Mode              | Output                                                                          | Best for                                                |
| ----------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `split` (default) | Small container `.lynx.bundle` plus independently fetched lazy `.bundle` chunks | ReactLynx UI, caching, and requested-expose loading     |
| `single`          | One native `.lynx.bundle` containing background-only module chunks              | Non-UI native modules requiring one deployment artifact |

`split` is the federation-safe default. It avoids placing every expose and
shared fallback in the entry bundle. Keep all emitted lazy `.bundle` files
beside the remote entry (or under its manifest `publicPath`) when publishing.
Each ReactLynx exposure needs its own paired background/main-thread lazy root,
so Web remotes reject `single`. Native `single` is limited to background-only
modules; ReactLynx UI exposures must remain split.

Ordinary Rspeedy entry bundles are preserved by default. A dedicated remote
environment may set `preserveSourceEntryBundles: false` to publish only its
manifest, federation container, and split exposure bundles.

```mermaid
flowchart LR
  H["Host import or loadRemote"] --> M["mf-manifest.json"]
  M --> C["container.lynx.bundle"]
  C --> R["Module Federation container"]
  R --> A["ActivityFeed lazy .bundle"]
  R --> D["Details lazy .bundle"]
  R --> S["host-provided shared modules"]
```

The runtime fetches and registers the container with `lynx.fetchBundle`, then
evaluates its section with `lynx.loadScript`. In split mode, the generated
Lynx async-chunk map supplies the lazy `.bundle` URL; `lynx.loadLazyBundle`
fetches it, and the returned `ids`, `modules`, and `runtime` install into the
calling webpack runtime. Failed and timed-out entry loads are evicted so a
later request can retry. The default timeout is 30 seconds and can be changed
with `runtimePluginOptions.timeout`.

The manifest declares `remoteEntry.type: 'lynx'`. The runtime plugin handles
only that type (or a `.lynx.bundle` URL), leaving `script`, `module`, and other
runtime-core loaders untouched. Explicit background-only raw JavaScript entries
may use `type: 'lynx-js'` and `lynx.requireModuleAsync`.

## Layers and singletons

With `mainThread: true`, exposes are compiled for both Lynx issuer layers and
shared declarations are registered in a realm-qualified scope. Unqualified
shares default to the background realm; use `realm: 'main-thread'` only for a
module authored for that runtime. The semantic realm is resolved against the
DSL's exposed layer constants, so application configs do not hard-code layer
names.

A singleton is unique within one JavaScript realm, share scope, and share key.
The host, compiled imports, runtime API consumers, and remotes can therefore
share one stateful instance inside the background realm. The main-thread realm
gets a separate instance by design: Lynx does not transfer JavaScript object
identity across its thread boundary.

Prefer the official ReactLynx lazy-runtime bridge for UI bundles. An exact
`@lynx-js/react` share does not cover `/internal`, JSX-runtime, Lepus, and lazy
subpaths; partial ReactLynx sharing creates distinct runtime state. Application
state and other ordinary libraries are safe singleton candidates.

One realm-neutral container program carries internal layer-specific expose
aliases. Keys ending in `__main_thread` are reserved for those aliases; users
still import the public key such as `catalog/Card`.

```mermaid
flowchart TB
  C["One compiled container"] --> B["BACKGROUND expose aliases"]
  C --> T["MAIN_THREAD expose aliases"]
  B --> BS["default:react:background"]
  T --> TS["default:react:main-thread"]
  BS --> BI["background singleton instance"]
  TS --> TI["main-thread singleton instance"]
```

Native TASM/MTS main-thread output is currently rejected because the enhanced
federation runtime is not TASM-compatible. Native federation supports the
background realm; dual-realm federation targets Lynx for Web.

See `apps/lynx-module-federation-demo` for an official Rspeedy native app,
native artifact checks, and a real Lynx for Web browser E2E.
