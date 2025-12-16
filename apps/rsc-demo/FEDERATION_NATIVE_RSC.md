# Federation-Native RSC Architecture

## Problem Statement

The current RSC implementation has several non-federation patterns:

1. **Manual `componentMap`** - Every client component must be hand-imported in `ssr-entry.js`
2. **JSON File Fetching** - Runtime plugin fetches `mf-stats.json`, `react-server-actions-manifest.json` separately
3. **String-based Resolution** - SSR uses path string matching, not MF protocol
4. **No `loadRemote` Integration** - SSR doesn't use the core federation primitive
5. **HTTP Server Actions Fallback** - Remote actions still default to HTTP forwarding

## Design Philosophy

**Core Principle**: Use `loadRemote()` as the universal module resolver for SSR.

Instead of:
```javascript
// Current: Manual componentMap + string matching
const componentMap = { './src/Button.js': { default: Button } };
__webpack_require__(moduleId) → componentMap[path]
```

Do:
```javascript
// Federation-native: loadRemote is the resolver
__webpack_require__(moduleId) → loadRemote(moduleId, { layer: 'ssr' })
```

---

## Architecture Overview

### The Key Insight: Layer-Aware Remote Entries

Each federated app builds **three remote entries**:

```
app1/
├── remoteEntry.client.js  → Exposes client-layer modules
├── remoteEntry.server.js  → Exposes RSC-layer modules
└── remoteEntry.ssr.js     → Exposes SSR-layer modules (NEW)
```

The SSR layer exposes the **same modules** but compiled for SSR context:
- Actual component code (not client references)
- No `'use server'` transforms (error stubs)
- Node.js compatible (no browser APIs)

### Module Resolution Protocol

```
RSC Flight Stream contains: $L{"id":"(client)/./src/Button.js", ...}
                                      ↓
                    __webpack_require__("(client)/./src/Button.js")
                                      ↓
                    rscSSRPlugin intercepts the call
                                      ↓
                    Maps moduleId → federation expose path
                    "(client)/./src/Button.js" → "app1/Button"
                                      ↓
                    loadRemote("app1/Button", { layer: 'ssr' })
                                      ↓
                    Federation runtime loads from remoteEntry.ssr.js
                                      ↓
                    Returns actual component for SSR rendering
```

---

## Implementation

### 1. Build Configuration: SSR Remote Entry

Add a dedicated SSR layer remote entry that exposes client components:

```javascript
// scripts/ssr.build.js - ENHANCED
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.ssr.js',  // NEW: SSR-specific entry
  library: { type: 'commonjs-module', name: 'app1_ssr' },

  // Expose ALL client components for SSR resolution
  exposes: {
    './DemoCounterButton': './src/DemoCounterButton.js',
    './EditButton': './src/EditButton.js',
    './Button': './src/Button.js',
    // Auto-generated from react-client-manifest.json at build time
  },

  // SSR-specific share scope
  shared: {
    react: { shareScope: 'ssr', singleton: true },
    'react-dom': { shareScope: 'ssr', singleton: true },
  },

  shareScope: ['ssr'],

  // Include the SSR resolver plugin
  runtimePlugins: [
    require.resolve('@module-federation/node/runtimePlugin'),
    require.resolve('./rscSSRResolverPlugin.js'),
  ],
})
```

### 2. Build-Time: Auto-Generate Exposes from Client Manifest

Instead of manually listing exposes, derive them from the client manifest:

```javascript
// scripts/generateSSRExposes.js
const clientManifest = require('../build/react-client-manifest.json');

function generateSSRExposes() {
  const exposes = {};

  for (const [filePath, entry] of Object.entries(clientManifest)) {
    // Convert file path to expose name
    // "file:///path/to/app1/src/Button.js" → "./Button"
    const relativePath = filePath.replace(/^file:\/\/.*\/src\//, './').replace('.js', '');
    const sourcePath = filePath.replace('file://', '');

    exposes[relativePath] = sourcePath;
  }

  return exposes;
}

module.exports = { generateSSRExposes };
```

### 3. Runtime Plugin: Federation-Native SSR Resolver

The core innovation - replace `__webpack_require__` with `loadRemote`:

```javascript
// plugins/rscSSRResolverPlugin.js
const { FederationHost } = require('@module-federation/runtime');

function rscSSRResolverPlugin() {
  // Module cache - populated by loadRemote, used by __webpack_require__
  const ssrModuleCache = new Map();

  // Maps RSC module IDs to federation expose paths
  // Built from manifest during init
  const moduleIdToExpose = new Map();

  let federationHost = null;

  return {
    name: 'rsc-ssr-resolver-plugin',
    version: '2.0.0',

    /**
     * beforeInit: Capture federation host and build module ID mapping
     */
    beforeInit(args) {
      federationHost = args.origin;
      return args;
    },

    /**
     * init: Setup __webpack_require__ to use loadRemote
     */
    init(args) {
      const { origin } = args;

      // Build moduleId → expose mapping from the manifest
      // The manifest contains all the RSC client component metadata
      buildModuleIdMapping(origin);

      // Install federation-native webpack_require
      installFederationResolver(origin);

      return args;
    },

    /**
     * loadSnapshot: When loading remote manifests, capture RSC metadata
     */
    async loadSnapshot(args) {
      const { manifestJson, remote } = args;

      // Extract RSC component mappings from manifest
      if (manifestJson?.rsc?.clientComponents) {
        for (const [exposePath, component] of Object.entries(manifestJson.rsc.clientComponents)) {
          // Map moduleId → remote/expose
          moduleIdToExpose.set(component.moduleId, {
            remote: remote.name,
            expose: exposePath,
            moduleId: component.moduleId,
          });
        }
      }

      return args;
    },

    /**
     * onLoad: Cache loaded modules for SSR resolution
     */
    async onLoad(args) {
      const { id, exposeModule, remote, expose } = args;

      // Store in cache with multiple keys for flexible lookup
      if (exposeModule) {
        const cacheKey = `${remote?.name || 'local'}/${expose}`;
        ssrModuleCache.set(cacheKey, exposeModule);

        // Also cache by moduleId if we have the mapping
        for (const [moduleId, mapping] of moduleIdToExpose.entries()) {
          if (mapping.remote === remote?.name && mapping.expose === expose) {
            ssrModuleCache.set(moduleId, exposeModule);
          }
        }
      }

      return args;
    },
  };

  /**
   * Build the moduleId → expose mapping from host's manifest
   */
  function buildModuleIdMapping(host) {
    // Get RSC metadata from host's options (injected at build time)
    const rscConfig = host.options?.rsc || {};

    if (rscConfig.clientComponents) {
      for (const [exposePath, component] of Object.entries(rscConfig.clientComponents)) {
        moduleIdToExpose.set(component.moduleId, {
          remote: host.name,
          expose: exposePath,
          moduleId: component.moduleId,
        });
      }
    }
  }

  /**
   * SSR resolution (no global __webpack_require__ patch)
   *
   * The demo intentionally avoids exposing/overriding a global webpack require.
   * Instead, SSR builds a React "Server Consumer Manifest" `moduleMap` that
   * points client IDs at the SSR bundle's module IDs (`ssrRequest`) using the
   * `mf-manifest.ssr.json` `additionalData.rsc.clientComponents` registry.
   *
   * Federation (when needed) is handled by the webpack/federation runtime
   * inside the SSR bundle (via `__webpack_require__.federation`), not via a
   * global require shim.
   */

  /**
   * Derive expose path from file path
   */
  function deriveExposeFromPath(cleanId, host) {
    // "./src/Button.js" → "./Button"
    // "../shared-rsc/src/Widget.js" → "@rsc-demo/shared-rsc/Widget"

    const parts = cleanId.split('/');
    const filename = parts.pop().replace('.js', '');

    // Check if it's a local expose
    if (cleanId.startsWith('./src/')) {
      return {
        remote: host.name,
        expose: `./${filename}`,
        moduleId: cleanId,
      };
    }

    // Check for package references
    if (cleanId.includes('@rsc-demo/')) {
      const match = cleanId.match(/@rsc-demo\/([^/]+)/);
      if (match) {
        return {
          remote: match[1],
          expose: `./${filename}`,
          moduleId: cleanId,
        };
      }
    }

    return null;
  }
}

module.exports = rscSSRResolverPlugin;
```

### 4. Preload SSR Modules During Initialization

Before rendering, preload all client components via federation:

```javascript
// framework/ssrPreloader.js
const { init, loadRemote, preloadRemote } = require('@module-federation/runtime');

/**
 * Preload all SSR modules from the manifest
 * Call this once at server startup, not per-request
 */
async function preloadSSRModules(federationHost) {
  const manifest = federationHost.options.manifest;

  // Get all client component exposes
  const exposes = manifest?.rsc?.clientComponents || {};

  const preloadPromises = [];

  for (const [exposePath, component] of Object.entries(exposes)) {
    // Preload each component
    preloadPromises.push(
      loadRemote(`${federationHost.name}/${exposePath.replace('./', '')}`)
        .catch(err => {
          console.warn(`[SSR] Failed to preload ${exposePath}:`, err.message);
          return null;
        })
    );
  }

  // Also preload remote components
  for (const remote of federationHost.options.remotes || []) {
    preloadPromises.push(
      preloadRemote([{ nameOrAlias: remote.name, exposes: ['*'] }])
        .catch(err => {
          console.warn(`[SSR] Failed to preload remote ${remote.name}:`, err.message);
        })
    );
  }

  await Promise.all(preloadPromises);

  console.log(`[SSR] Preloaded ${Object.keys(exposes).length} local components`);
}

module.exports = { preloadSSRModules };
```

### 5. New SSR Entry: Zero Manual Imports

The new SSR entry has **no manual imports** - everything comes from federation:

```javascript
// src/framework/ssr-entry.js - REWRITTEN
import { createFromNodeStream } from 'react-server-dom-webpack/client.node';
import { renderToPipeableStream } from 'react-dom/server';
import { Readable } from 'stream';

// Federation runtime is initialized by the plugin

/**
 * Render an RSC flight stream to HTML
 * No componentMap needed - federation handles all resolution
 */
export async function renderFlightToHTML(flightBuffer, ssrManifest) {
  // The ssrManifest maps moduleIds to chunk info
  // But our __webpack_require__ ignores chunks (uses loadRemote instead)

  const flightStream = Readable.from([flightBuffer]);

  // createFromNodeStream will call __webpack_require__ for each $L reference
  // Our plugin intercepts and uses loadRemote to resolve
  const tree = await createFromNodeStream(flightStream, ssrManifest);

  return new Promise((resolve, reject) => {
    let html = '';
    const { pipe } = renderToPipeableStream(tree, {
      onShellReady() {
        pipe({
          write: chunk => { html += chunk.toString(); },
          end: () => resolve(html),
        });
      },
      onShellError: reject,
      onError: err => console.error('SSR streaming error:', err),
    });
  });
}

/**
 * Build SSR manifest from federation metadata
 * No file reading - uses data from federation init
 */
export function buildSSRManifest(federationHost) {
  const moduleMap = {};

  // Get RSC metadata from federation host
  const rscConfig = federationHost.options?.rsc || {};
  const clientComponents = rscConfig.clientComponents || {};

  for (const [exposePath, component] of Object.entries(clientComponents)) {
    const moduleId = component.moduleId;
    moduleMap[moduleId] = {
      default: { id: moduleId, name: 'default', chunks: [] },
      '*': { id: moduleId, name: '*', chunks: [] },
      '': { id: moduleId, name: '', chunks: [] },
    };
  }

  return {
    moduleLoading: { prefix: '', crossOrigin: null },
    moduleMap,
    serverModuleMap: null,
  };
}
```

### 6. Server Actions: Federation-Native Registration

Extend the pattern to server actions - use `loadRemote` instead of manifest fetching:

```javascript
// plugins/rscServerActionsPlugin.js
const { registerServerReference } = require('react-server-dom-webpack/server');

function rscServerActionsPlugin() {
  const registeredActions = new Set();

  return {
    name: 'rsc-server-actions-plugin',
    version: '2.0.0',

    /**
     * initContainer: Auto-register server actions from remote
     */
    async initContainer(args) {
      const { remoteInfo, remoteEntryExports } = args;

      // Check if this remote has server-actions expose
      // This info comes from the manifest loaded during init
      const rscConfig = args.remoteSnapshot?.rsc || {};
      const exposeTypes = rscConfig.exposeTypes || {};

      if (exposeTypes['./server-actions'] === 'server-action') {
        await registerActionsFromRemote(
          remoteInfo,
          remoteEntryExports,
          rscConfig
        );
      }

      return args;
    },

    /**
     * onLoad: Register actions when server-actions module is loaded
     */
    async onLoad(args) {
      const { expose, exposeModule, remote } = args;

      if (expose === './server-actions' && exposeModule) {
        await registerActionsFromModule(
          remote?.name || 'local',
          exposeModule,
          args.remoteSnapshot?.rsc
        );
      }

      return args;
    },
  };

  async function registerActionsFromRemote(remoteInfo, remoteEntry, rscConfig) {
    const remoteName = remoteInfo.name;
    const registrationKey = `${remoteName}:server-actions`;

    if (registeredActions.has(registrationKey)) return;

    try {
      // Use the remote entry's get() to load server-actions
      // This is pure federation protocol - no HTTP fetching
      const factory = await remoteEntry.get('./server-actions');
      if (!factory) return;

      const module = await factory();
      await registerActionsFromModule(remoteName, module, rscConfig);

      registeredActions.add(registrationKey);
    } catch (err) {
      console.warn(`[RSC] Failed to register actions from ${remoteName}:`, err.message);
    }
  }

  async function registerActionsFromModule(remoteName, module, rscConfig) {
    // Get action metadata from RSC config (part of manifest)
    const serverActions = rscConfig?.serverActions || {};

    for (const [actionId, actionDef] of Object.entries(serverActions)) {
      const fn = actionDef.exportName === 'default'
        ? module.default
        : module[actionDef.exportName];

      if (typeof fn === 'function') {
        registerServerReference(fn, actionId, actionDef.exportName);
      }
    }
  }
}

module.exports = rscServerActionsPlugin;
```

---

## Manifest Structure: Embedding RSC Metadata

All RSC data lives in `mf-manifest.json` via `additionalData`:

```javascript
// Build config: Embed RSC metadata into MF manifest
new ModuleFederationPlugin({
  manifest: {
    additionalData: async ({ compilation }) => {
      // Read react-client-manifest.json (build artifact)
      const clientManifest = JSON.parse(
        compilation.assets['react-client-manifest.json'].source()
      );

      // Read react-server-actions-manifest.json (build artifact)
      const actionsManifest = JSON.parse(
        compilation.assets['react-server-actions-manifest.json'].source()
      );

      // Transform to federation-friendly format
      return {
        rsc: {
          layer: 'rsc',

          // Client components: moduleId → expose mapping
          clientComponents: transformClientManifest(clientManifest),

          // Server actions: actionId → metadata
          serverActions: transformActionsManifest(actionsManifest),

          // Expose types for quick lookups
          exposeTypes: {
            './Button': 'client-component',
            './server-actions': 'server-action',
          },
        },
      };
    },
  },
});

function transformClientManifest(manifest) {
  const result = {};

  for (const [filePath, entry] of Object.entries(manifest)) {
    // Derive expose name from file path
    const exposeName = deriveExposeName(filePath);

    result[exposeName] = {
      moduleId: entry.id,
      chunks: entry.chunks,
      exports: [entry.name],
      filePath: filePath.replace('file://', ''),
    };
  }

  return result;
}

function transformActionsManifest(manifest) {
  const result = {};

  for (const [actionId, entry] of Object.entries(manifest)) {
    result[actionId] = {
      moduleId: entry.id,
      exportName: entry.name,
      async: true,
    };
  }

  return result;
}
```

---

## Runtime Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVER STARTUP                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. init(@module-federation/runtime)                                        │
│     │                                                                        │
│     ├─► Load mf-manifest.json (contains rsc.clientComponents)               │
│     │                                                                        │
│     ├─► rscSSRResolverPlugin.init()                                         │
│     │   └─► Build moduleIdToExpose mapping from manifest.rsc                │
│     │   └─► Install federation-native __webpack_require__                   │
│     │                                                                        │
│     └─► preloadSSRModules()                                                 │
│         └─► loadRemote() for each clientComponent                           │
│         └─► Populate ssrModuleCache                                         │
│                                                                              │
│  2. rscServerActionsPlugin.initContainer()                                  │
│     └─► remoteEntry.get('./server-actions')                                 │
│     └─► registerServerReference() for each action                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REQUEST HANDLING                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GET /                                                                       │
│     │                                                                        │
│     ├─► RSC Server renders to Flight stream                                 │
│     │   └─► $L{"id":"(client)/./src/Button.js",...}                        │
│     │                                                                        │
│     ├─► SSR Worker: renderFlightToHTML(flightBuffer)                        │
│     │   │                                                                    │
│     │   ├─► createFromNodeStream() parses Flight                            │
│     │   │   │                                                                │
│     │   │   └─► For each $L reference:                                      │
│     │   │       │                                                            │
│     │   │       └─► __webpack_require__("(client)/./src/Button.js")         │
│     │   │           │                                                        │
│     │   │           └─► rscSSRResolverPlugin intercepts                     │
│     │   │               │                                                    │
│     │   │               ├─► Check ssrModuleCache (preloaded)                │
│     │   │               │   └─► Return cached module ✓                      │
│     │   │               │                                                    │
│     │   │               └─► If not cached: loadRemote('app1/Button')        │
│     │   │                                                                    │
│     │   └─► renderToPipeableStream(tree) → HTML                             │
│     │                                                                        │
│     └─► Return SSR HTML + embedded Flight data                              │
│                                                                              │
│  POST /react (Server Action)                                                 │
│     │                                                                        │
│     ├─► Extract actionId from header                                        │
│     │                                                                        │
│     ├─► getServerAction(actionId)                                           │
│     │   └─► Already registered by plugin during init                        │
│     │                                                                        │
│     ├─► Execute action(...args)                                             │
│     │                                                                        │
│     └─► Re-render and stream Flight response                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer-Aware Module Loading

### Option A: Separate Remote Entries

```javascript
// Different remote entries per layer
remotes: {
  'app2/client': 'app2@http://localhost:4102/remoteEntry.client.js',
  'app2/ssr': 'app2@http://localhost:4102/remoteEntry.ssr.js',
  'app2/rsc': 'app2@http://localhost:4102/remoteEntry.server.js',
}

// Resolution based on context
loadRemote('app2/Button', { layer: 'ssr' })
  → loads from remoteEntry.ssr.js
```

### Option B: Resource Query Decoration

```javascript
// Single remote with layer query
loadRemote('app2/Button?layer=ssr')

// Plugin intercepts and routes to correct entry
beforeRequest(args) {
  const layer = parseLayerFromQuery(args.id);
  if (layer === 'ssr') {
    args.remote.entry = args.remote.entry.replace('.client.js', '.ssr.js');
  }
  return args;
}
```

### Option C: Share Scope Based Resolution

```javascript
// SSR components stored in 'ssr' share scope
shared: {
  '@app1/Button': { shareScope: 'ssr', get: () => loadRemote('app1/Button') },
}

// Resolution uses share scope
resolveShare(args) {
  if (args.scope === 'ssr' && isClientComponent(args.pkgName)) {
    return loadRemote(args.pkgName);
  }
}
```

---

## Benefits Over Current Architecture

| Aspect | Current | Federation-Native |
|--------|---------|-------------------|
| **Component Discovery** | Manual componentMap | Auto from mf-manifest |
| **Module Resolution** | String path matching | loadRemote() protocol |
| **JSON Fetching** | 3+ separate fetches | Single manifest read |
| **Server Actions** | HTTP forwarding + manifest fetch | Direct loadRemote |
| **Remote Components** | Manual imports | Transparent federation |
| **Preloading** | None | Federation preloadRemote |
| **Caching** | Custom cache | Share scope + moduleCache |
| **Error Handling** | Try/catch blocks | errorLoadRemote hook |
| **Type Safety** | None | Manifest-driven types |

---

## Implementation Phases

### Phase 1: Build Infrastructure
- [ ] Add SSR remote entry generation (`remoteEntry.ssr.js`)
- [ ] Auto-generate exposes from react-client-manifest.json
- [ ] Embed RSC metadata in mf-manifest.json additionalData

### Phase 2: SSR Resolution Plugin
- [ ] Implement rscSSRResolverPlugin
- [ ] Replace __webpack_require__ with loadRemote
- [ ] Add module preloading at startup

### Phase 3: Server Actions Plugin
- [ ] Implement rscServerActionsPlugin
- [ ] Register actions via federation protocol
- [ ] Remove HTTP forwarding default

### Phase 4: Cleanup
- [ ] Remove manual componentMap from ssr-entry.js
- [ ] Remove JSON fetching from rscRuntimePlugin
- [ ] Remove HTTP fallback for server actions

---

## Key Files to Modify

```
apps/rsc-demo/packages/
├── app-shared/
│   └── plugins/
│       ├── rscSSRResolverPlugin.js      # NEW - Core SSR resolver
│       └── rscServerActionsPlugin.js    # NEW - Actions via federation
│
├── app1/
│   ├── scripts/
│   │   ├── build.js                     # Add SSR MF entry
│   │   └── ssr.build.js                 # Add MF plugin with exposes
│   │
│   └── src/framework/
│       └── ssr-entry.js                 # REWRITE - No componentMap
│
└── app2/
    └── (same structure)
```

---

## Summary

The federation-native approach transforms RSC SSR from a **parallel system** that happens to coexist with MF into a **native federation consumer**. Every module resolution goes through `loadRemote()`, metadata comes from the manifest, and the runtime plugin system provides all the hooks needed for RSC-specific behavior.

**The core insight**: `__webpack_require__` in SSR context should be `loadRemote()` with a layer parameter. This single change eliminates manual component maps, separate JSON fetching, and creates a unified resolution path for local and remote components.
