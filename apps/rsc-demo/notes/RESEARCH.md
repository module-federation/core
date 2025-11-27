# Repository Research: React Server Components Architecture

This document explains how React Server Components (RSC) and Server Actions work in this repo, how webpack layering and the manifests fit together, and what actually runs on the server vs in the browser.

**Key Architecture Decision**: This repo uses **webpack build-time conditions** (`resolve.conditionNames`) to resolve `react-server` exports. No `--conditions=react-server` Node.js flag is needed at runtime. The bundled server (`server.rsc.js`) contains all React server exports pre-resolved.

---

## 1. Layout (RSC-Relevant Parts)

- `packages/app1`, `packages/app2`
  - `src/App.js` – root RSC tree (server components + client islands).
  - `src/framework/router.js` – browser RSC router, `callServer`, and Flight client APIs.
  - `src/InlineActionDemo.server.js` – example server component using inline `'use server'` actions.
  - `src/InlineActionButton.js` – client component that calls server actions.
  - `scripts/build.js` – layered webpack build (client + RSC bundles, manifests).
  - `server/api.server.js` – Express server, RSC renderer and `/react` actions endpoint.
- `packages/react-server-dom-webpack`
  - Vendored `react-server-dom-webpack` runtime with custom hooks/loaders:
    - `cjs/react-server-dom-webpack-node-register.js`
    - `cjs/rsc-client-loader.js`
    - `cjs/rsc-server-loader.js`
    - `cjs/rsc-ssr-loader.js`
    - `server.node.js` / `server.node.unbundled.js` (dynamic manifest + action registry).
- `packages/e2e/rsc` – node test suite that exercises the built server and manifests.

---

## 2. Build Pipeline & Webpack Layers

Each app has a layered webpack build (`experiments.layers = true`) in `scripts/build.js`.

### 2.1 Layers

We use explicit layer tags (mirroring Next.js):

- `rsc` – React Server Components / Server Actions layer. Webpack uses `resolve.conditionNames: ['react-server', ...]` to resolve React's server exports **at build time**.
- `ssr` – Server-Side Rendering layer for rendering RSC flight streams to HTML (no `react-server` condition).
- `client` – browser/client bundle (hydration, client components).

**Important**: The `rsc` layer's `resolve.conditionNames` configuration means webpack resolves `react-server` exports during bundling. The output (`server.rsc.js`) contains pre-resolved server APIs, so **no `--conditions=react-server` flag is needed at runtime**.

### 2.2 Client Bundle (browser)

Client config (`webpackConfig`):

- `entry.main` → `../src/framework/bootstrap.js` with `layer: 'client'`.
- `module.rules` for `*.js`:
  - `issuerLayer: 'rsc'` → `babel-loader` + `rsc-server-loader` (for RSC imports pushed into the client build).
  - `issuerLayer: 'ssr'` → `babel-loader` + `rsc-ssr-loader`.
  - default (client) → `babel-loader` + `rsc-client-loader`.
- `ReactServerWebpackPlugin({ isServer: false })` produces:
  - `build/react-client-manifest.json`
    - Maps client modules (e.g. `'(client)/./src/InlineActionButton.js'`) to chunk ids (`client2`, `client2.js`).
    - This manifest is passed to `renderToPipeableStream` so the server knows how to refer to client components in the Flight stream.

### 2.3 RSC Build (server bundle)

RSC config (`serverConfig`):

- `target: 'node'`, library `commonjs2`.
- `entry.server` → `../src/server-entry.js` with `layer: 'rsc'`.
- Same `layers`/`oneOf` scheme, but biased towards `rsc` (server-only):
  - For server we always apply `rsc-server-loader` so file‑level `'use server'` and inline actions get registered.
- `ReactServerWebpackPlugin({ isServer: true })` produces:
  - `build/react-server-actions-manifest.json`
    - Keys: action IDs like `file:///.../src/server-actions.js#incrementCount`.
    - Values: `{ id: moduleUrl, name: exportName, chunks: [] }`.
    - Sources:
      - File‑level `'use server'` modules (AST scan in the plugin).
      - `rsc-client-loader.serverReferencesMap` (for client-transformed actions).
      - `rsc-server-loader.inlineServerActionsMap` (for inline actions inside components).

> **Production Mode**: The server loads `build/server.rsc.js` directly—no `node-register` or `--conditions` flag needed. Webpack already resolved all `react-server` exports at build time via `resolve.conditionNames`.

### 2.4 SSR Build (server-side rendering bundle, app1)

For **app1**, SSR config (`ssrConfig`) lives in `packages/app1/scripts/build.js`:

- `target: 'node'`, library `commonjs2`.
- `entry.ssr` → `../src/framework/ssr-entry.js` with `layer: 'ssr'`.
- Bundles all client components for Node.js execution (without `--conditions=react-server`).
- Output: `build/ssr.js` – contains compiled client components for SSR.

**Why a separate SSR bundle (app1)?**

In app1, the RSC bundle is built with `react-server` condition, which means `react-dom/server` APIs are not included in `server.rsc.js`. To render RSC flight streams to HTML, we need a separate SSR process that:
1. Can import `react-dom/server` (renderToPipeableStream)
2. Can import `react-server-dom-webpack/client.node` (createFromNodeStream)
3. Has access to all client components compiled for Node.js

The SSR entry (`src/framework/ssr-entry.js`) exports all app1 client components with a `componentMap`:

```js
export const componentMap = {
  './src/DemoCounterButton.js': { default: DemoCounterButton },
  './src/EditButton.js': { default: EditButton },
  './src/NoteEditor.js': { default: NoteEditor },
  './src/SearchField.js': { default: SearchField },
  './src/SidebarNoteContent.js': { default: SidebarNoteContent },
  './src/framework/router.js': Router,
};
```

---

## 3. Runtime: Bundled RSC Server

The server entry (`server/api.server.js`) loads the **pre-built RSC bundle**:

```js
function getRSCServer() {
  if (!rscServer) {
    const bundlePath = path.resolve(__dirname, '../build/server.rsc.js');
    rscServer = require(bundlePath);
  }
  return rscServer;
}
```

The bundle (`server.rsc.js`) was built by webpack with `resolve.conditionNames: ['react-server', ...]`, so it already contains the correct React server exports. **No `--conditions=react-server` flag or `node-register` hook is needed.**

### 3.0 How Webpack Resolves `react-server` Exports

When webpack builds the RSC layer, it uses:

```js
resolve: {
  conditionNames: ['react-server', 'import', 'require', 'node'],
}
```

This tells webpack to check `package.json` exports for `react-server` condition first. For example, React's `package.json` has:

```json
{
  "exports": {
    ".": {
      "react-server": "./react.react-server.js",
      "default": "./index.js"
    }
  }
}
```

Webpack resolves to `react.react-server.js` at **build time** and bundles those exports into `server.rsc.js`. At runtime, Node.js just loads the pre-resolved bundle.

### 3.1 `'use client'` Handling

`rsc-server-loader` transforms `'use client'` modules into `createClientModuleProxy(moduleUrl)` calls. When a Server Component imports a client file, the server never sees actual React code, only a serializable proxy reference.

### 3.2 File-level `'use server'` modules (server actions)

`rsc-server-loader` processes modules that start with `'use server'`:

1. Adds `registerServerReference(fn, moduleUrl, exportName)` calls for each export.
2. At runtime, `server.node.js` stores entries into:
   - `serverActionRegistry` – `Map<actionId, fn>` for lookup by action ID.
   - `dynamicServerActionsManifest` – merged into the static manifest at request time.

Action IDs:

- Default exports: `file:///path/to/module.js#default`.
- Named exports: `file:///path/to/module.js#exportName`.

### 3.3 Inline `'use server'` functions

Inside server components like `InlineActionDemo.server.js`, actions can be defined inline:

```js
async function addMessage(formData) {
  'use server';
  // update server-only state
}
```

`rsc-server-loader` detects inline server actions via AST analysis and injects registration calls:

```js
;(function(){
  if (typeof addMessage === 'function') {
    require('react-server-dom-webpack/server')
      .registerServerReference(addMessage, moduleUrl, 'addMessage');
  }
})();
```

The loader populates `inlineServerActionsMap` for manifest generation.

---

## 4. Manifests & How They’re Used

### 4.1 Client Manifest – `react-client-manifest.json`

Generated by `ReactServerWebpackPlugin({ isServer: false })` in the **client** build.

- Keys: internal client module IDs like `"(client)/./src/InlineActionButton.js"`.
- Values: `{ id: 'client2', name: 'default', chunks: ['client2.js'] }` etc.
- `server/api.server.js` loads this file in `renderReactTree` and passes it to the bundled RSC server:
  ```js
  async function renderReactTree(res, props) {
    await waitForWebpack();
    const manifest = readFileSync(
      path.resolve(__dirname, '../build/react-client-manifest.json'),
      'utf8'
    );
    const moduleMap = JSON.parse(manifest);

    const server = getRSCServer();
    const { pipe } = server.renderApp(props, moduleMap);
    pipe(res);
  }
  ```
- Inside the bundled RSC server, `renderApp` calls `renderToPipeableStream` with this manifest so the Flight payload can reference the right client chunks.

### 4.2 Server Actions Manifest – `react-server-actions-manifest.json`

Generated by `ReactServerWebpackPlugin({ isServer: true })` in the **RSC/server** build.

- Keys: action IDs, always including `#name` (default uses `#default`).
- Values: `{ id: moduleUrl, name: exportName, chunks: [] }`.
- At request time the Express `/react` POST handler does:
  ```js
  const manifestPath = path.resolve(__dirname, '../build/react-server-actions-manifest.json');
  let serverActionsManifest = {};
  if (existsSync(manifestPath)) {
    serverActionsManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  }

  const server = getRSCServer();
  const dynamicManifest = server.getDynamicServerActionsManifest() || {};
  serverActionsManifest = Object.assign({}, serverActionsManifest, dynamicManifest);

  const actionFn = server.getServerAction(actionId);
  ```
- Both file-level `'use server'` exports and inline actions are ultimately resolved via `server.getServerAction(actionId)` from the bundled RSC server. The manifest is primarily used by React’s `decodeReply`/`decodeReplyFromBusboy` to understand how to deserialize arguments.

### 4.3 Dynamic Manifest

`server.node.js` maintains `dynamicServerActionsManifest` so that inline actions registered at runtime (e.g. inside component functions) still have manifest entries. This is merged into the static manifest for `decodeReply`/`decodeReplyFromBusboy` so React’s decoder knows the action shapes.

### 4.4 MF metadata lives in HTTP `mf-stats.json`

- app2’s ModuleFederationPlugin writes `additionalData.rsc` into `mf-stats.json` with:
  - `remote.serverContainer`, `actionsEndpoint`, `serverActionsManifest`, `clientManifest` — all **HTTP URLs** (no filesystem paths).
  - `exposeTypes` so the runtime knows which exposes are server-actions vs client components.
- The host runtime plugin (`rscRuntimePlugin`) fetches those URLs at runtime; it only falls back to filesystem reads with a warning.
- Remotes build as **CommonJS containers** (`library.type: 'commonjs-module'`, `target: 'async-node'`) but hosts load them via **`remoteType: 'script'`**. The Node federation runtime plugin patches chunk loading for async-node targets, so no global shim is required.
- Build-time manifest patching is removed; discovery happens from the remote’s published metadata.

---

## 5. Server Actions Request Flow

Client code (`src/framework/router.js`) exposes:

```js
export async function callServer(actionId, args) {
  const body = await encodeReply(args);
  const response = await fetch('/react', {
    method: 'POST',
    headers: { 'Accept': 'text/x-component', [RSC_ACTION_HEADER]: actionId },
    body,
  });
  const resultHeader = response.headers.get('X-Action-Result');
  return resultHeader ? JSON.parse(resultHeader) : undefined;
}
```

`rsc-client-loader` transforms `'use server'` modules so each exported action is a `createServerReference(actionId, callServer)` stub; calling it from a client component ultimately invokes `callServer`.

On the server (`server/api.server.js`):

1. `app.post('/react', handler)` reads the `rsc-action` header into `actionId`.
2. It waits for the webpack build output and loads the bundled RSC server via `getRSCServer()`.
3. It loads the static server actions manifest from disk and merges it with the dynamic manifest from `server.getDynamicServerActionsManifest()`.
4. It looks up the function with `const actionFn = server.getServerAction(actionId)`; if this returns something other than a function, the handler responds with 404.
5. It decodes args using React’s Flight reply helpers on the bundled server:
   - If `Content-Type` is `multipart/form-data`, it pipes the request into Busboy and calls `server.decodeReplyFromBusboy(busboy, serverActionsManifest)`.
   - Otherwise, it reads the body as text and calls `server.decodeReply(body, serverActionsManifest)`.
6. It calls the action and sets the `X-Action-Result` header if a non-`undefined` result is returned:
  ```js
  const result = await actionFn(...argsArray);
  if (result !== undefined) {
     res.set('X-Action-Result', JSON.stringify(result));
  }
  ```
7. Finally, it re-renders the RSC tree via `renderReactTree` and streams a Flight payload back to the client.

On the client, the router receives the new Flight response, parses it with `createFromReadableStream`, and swaps the view.

---

## 6. Flight Payload & Hydration

The **Flight protocol** is a serialized stream of React elements and module references:

- The bundled RSC server’s `renderApp(props, moduleMap)` calls `renderToPipeableStream(React.createElement(ReactApp, props), moduleMap)` to produce chunks.
- The payload contains:
  - Module references: `I["(client)/./src/InlineActionButton.js",["client2","client2.js"],""]`.
  - Serialized props and JSX for server components.
  - Server action references: objects like `{ "id": "file:///...InlineActionDemo.server.js#addMessage", "bound": null }`.

Client side (`router.js`):

- Initial load: `createFromFetch(fetch('/react?location=...'))` returns a then-usable value for `use(...)`.
- After actions or mutations: `createFromReadableStream(response.body)` parses the new Flight stream and refreshes the view.

This architecture keeps server-only logic and data access on the server (RSC/RSA), while only sending serialized UI + client islands to the browser.

---

## 7. Server-Side Rendering (SSR) Implementation

### 7.1 The SSR Challenge (app1 + app2)

In both **app1** and **app2**, the RSC bundle is built with `react-server` condition, which uses React's server-only exports (no `react-dom/server`). To render HTML from RSC flight streams, both apps use a **subprocess architecture** with a separate SSR bundle.

### 7.2 SSR Worker (`packages/app1/server/ssr-worker.js`)

The SSR worker is a separate Node.js process that:
- Loads the SSR bundle (`build/ssr.js`) built without `react-server` condition
- Receives RSC flight data on stdin
- Outputs rendered HTML on stdout

**Key components:**

```js
const { renderToPipeableStream } = require('react-dom/server');
const { createFromNodeStream } = require('react-server-dom-webpack/client.node');
const ssrBundle = require('../build/ssr.js');
```

**SSR Manifest Format (following Next.js serverConsumerManifest):**

```js
function buildSSRManifest() {
  const moduleMap = {};
  for (const [fileUri, manifestEntry] of Object.entries(clientManifest)) {
    const moduleId = manifestEntry.id;
    moduleMap[moduleId] = {
      'default': { id: moduleId, name: 'default', chunks: [] },
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

The manifest maps module IDs to SSR resolution info. Each entry has three export name variants:
- `'default'` - for default exports (most React components)
- `'*'` - for namespace imports
- `''` - alternative way to reference default

**Module Loader Setup:**

```js
globalThis.__webpack_require__ = function(moduleId) {
  // Extract: "(client)/./src/Foo.js" -> "./src/Foo.js"
  const match = moduleId.match(/\(client\)\/(.+)/);
  const relativePath = match ? match[1] : moduleId;

  // Look up in componentMap from ssr-entry.js
  if (componentMap && componentMap[relativePath]) {
    return componentMap[relativePath];
  }
  return { default: function Placeholder() { return null; } };
};
```

### 7.3 SSR Request Flow

When a browser requests `/` (HTML page):

1. **Main server** (`api.server.js`) renders RSC to a flight buffer using the bundled RSC server:
   ```js
   const rscBuffer = await renderRSCToBuffer(props);
   ```

2. **Spawns SSR worker** as a subprocess and pipes the buffer to stdin:
   ```js
   const ssrWorker = spawn('node', [workerPath], { stdio: ['pipe', 'pipe', 'pipe'] });
   ssrWorker.stdin.write(rscBuffer);
   ssrWorker.stdin.end();
   ```

3. **Worker parses** the flight stream into a React tree:
   ```js
   const tree = await createFromNodeStream(flightStream, ssrManifest);
   ```

4. **Worker renders** to HTML with `react-dom/server`:
   ```js
   const { pipe } = renderToPipeableStream(tree, { onShellReady() { pipe(process.stdout); } });
   ```

5. **Main server** collects HTML, reads `index.html`, and injects:
   - The SSR HTML into `<div id="root">…</div>`
   - A `<script id="__RSC_DATA__">` tag containing the original RSC flight data for hydration

### 7.4 Hydration with Embedded RSC Data

The server embeds the RSC flight data in the HTML response:

```html
<script id="__RSC_DATA__" type="application/json">
  ${JSON.stringify(flightDataString)}
</script>
```

On the client (`bootstrap.js`):

```js
const rscDataEl = document.getElementById('__RSC_DATA__');
if (rscDataEl) {
  const rscData = JSON.parse(rscDataEl.textContent);
  initFromSSR(rscData);  // Populate router cache from embedded data
}
hydrateRoot(document.getElementById('root'), <Router />);
```

`initFromSSR` (`router.js`) converts the embedded data to a readable stream and caches it:

```js
export function initFromSSR(rscData) {
  const initialLocation = {
    selectedId: null,
    isEditing: false,
    searchText: '',
  };
  const locationKey = JSON.stringify(initialLocation);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(rscData));
      controller.close();
    }
  });
  const content = createFromReadableStream(stream);
  initialCache.set(locationKey, content);
}
```

This ensures hydration uses the same React tree that was server-rendered, avoiding mismatches.

### 7.5 SSR-Safe Client Components

Client components that use hooks like `useRouter()` must handle SSR gracefully. Since the `Router` component doesn't render during SSR (the worker renders the tree directly), the context is undefined:

```js
export function useRouter() {
  const context = useContext(RouterContext);
  // During SSR, return stub functions to prevent errors
  if (!context) {
    return {
      location: { selectedId: null, isEditing: false, searchText: '' },
      navigate: () => {},
      refresh: () => {},
    };
  }
  return context;
}
```

The stub values are safe because:
- Server-rendered HTML is static (navigation doesn't happen)
- After hydration, the real `Router` component provides the actual context
- This is the standard pattern for SSR-safe hooks

---

## 8. Complete Request Flow Diagram

### 8.1 Initial Page Load (with SSR)

```
Browser                    Server (bundled RSC)                         SSR Worker
   |                                      |                                  |
   |--- GET / -------------------------->|                                  |
   |                                      |                                  |
   |                         renderRSCToBuffer(props)                        |
   |                         -> bundled server.renderApp(props, manifest)    |
   |                         -> produces RSC flight buffer                   |
   |                                      |                                  |
   |                         spawn('node', ['ssr-worker.js'])                |
   |                                      |--- flight data (stdin) -------->|
   |                                      |                                  |
   |                                      |     createFromNodeStream(stream) |
   |                                      |     -> React tree                |
   |                                      |                                  |
   |                                      |     renderToPipeableStream(tree) |
   |                                      |     -> HTML output               |
   |                                      |                                  |
   |                                      |<-- HTML (stdout) ----------------|
   |                                      |                                  |
   |                         Build full HTML page:                           |
   |                         - SSR HTML content                              |
   |                         - <script> tags for chunks (from client build)  |
   |                         - __RSC_DATA__ with flight data                 |
   |                                      |                                  |
   |<-- HTML response --------------------|                                  |
   |                                      |                                  |
   | Parse HTML, display content          |                                  |
   | Load JS chunks                       |                                  |
   | initFromSSR(__RSC_DATA__)            |                                  |
   | hydrateRoot(root, <Router />)        |                                  |
   |                                      |                                  |
   | [Interactive app]                    |                                  |
```

### 8.2 Client Navigation (SPA-style)

```
Browser                    Server
   |                          |
   |--- GET /react?location=...|
   |                          |
   |          renderReactTree(res, props)
   |          -> bundled server.renderApp(props, manifest)
   |          -> RSC flight stream to response
   |                          |
   |<-- Flight stream --------|
   |                          |
   | createFromFetch(response)|
   | -> React tree            |
   | Update view              |
```

### 8.3 Server Action Call

```
Browser                    Server
   |                          |
   |--- POST /react ----------|
   |    Header: rsc-action    |
   |    Body: encoded args    |
   |                          |
   |          decodeReply/decodeReplyFromBusboy(manifest)                    |
   |          -> args array                                                  |
   |                                                                         |
   |          server.getServerAction(id)(...args)                            |
   |          -> result                                                      |
   |                                                                         |
   |          Set X-Action-Result header                                     |
   |          renderReactTree(res, props)                                    |
   |          -> RSC flight stream                                           |
   |                          |
   |<-- Flight + result ------|
   |                          |
   | Parse result from header |
   | createFromReadableStream |
   | Refresh view             |
```

---

## 9. Testing

### 9.1 Test Structure

Tests are organized in `packages/e2e/`:

- `rsc/*.test.js` – Node.js unit/integration tests (`node --test`)
- `e2e/*.e2e.test.js` – Playwright browser tests

### 9.2 Running Tests

```bash
# Build first (required - tests use bundled output)
pnpm build

# Unit tests (RSC endpoints, loaders, SSR)
pnpm run test:rsc

# E2E Playwright tests (browser interactions, hydration)
pnpm --filter e2e test:e2e:rsc

# All tests
pnpm test
```

Tests load the bundled `server.rsc.js` directly—no `--conditions=react-server` flag needed.

### 9.3 Key Test Scenarios

1. **SSR Content Before Hydration** – Verifies server-rendered HTML is visible with JavaScript disabled
2. **Server Actions** – Tests file-level and inline `'use server'` actions
3. **Flight Stream Format** – Validates RSC protocol output
4. **Hydration** – Confirms client picks up where server left off
5. **Navigation** – Tests SPA-style transitions via Flight fetches

---

## 10. Webpack Resolve Conditions (How This Repo Works)

### 10.1 Build-Time vs. Runtime Conditions

This repo uses **webpack build-time conditions** (`resolve.conditionNames`) like Next.js. No `--conditions=react-server` flag is needed at runtime:

| Aspect | This Repo (Webpack Conditions) |
|--------|------------------------------|
| How it works | Webpack resolves `react-server` exports at build time via `resolve.conditionNames` |
| Server startup | `node server.js` (no flags) |
| Source transforms | Webpack loaders at build time |
| Output | `server.rsc.js` bundle with pre-resolved exports |

### 10.2 Webpack Configuration

```js
// RSC layer - gets react-server exports
const rscConfig = {
  target: 'node',
  resolve: {
    conditionNames: ['react-server', 'import', 'require', 'node'],
  },
  module: {
    rules: [{
      test: /\.js$/,
      layer: 'rsc',
      use: ['babel-loader', 'rsc-server-loader'],
    }],
  },
};

// SSR layer - gets normal React exports (react-dom/server available)
const ssrConfig = {
  target: 'node',
  resolve: {
    conditionNames: ['import', 'require', 'node'],  // No react-server
  },
  module: {
    rules: [{
      test: /\.js$/,
      layer: 'ssr',
      use: ['babel-loader', 'rsc-ssr-loader'],
    }],
  },
};

// Client layer - browser exports
const clientConfig = {
  target: 'web',
  resolve: {
    conditionNames: ['browser', 'import', 'require'],
  },
};
```

### 10.3 Benefits of Build-Time Conditions

1. **No runtime flags** – `node server.js` just works
2. **Production-ready** – same approach as Next.js
3. **Self-contained bundles** – all dependencies pre-resolved
4. **Simpler deployment** – no special Node.js configuration needed

---

## 11. Module Federation & Federated Server Actions

This repo uses **@module-federation/enhanced** to share React and components between `app1` (host) and `app2` (remote), across both client and RSC server layers.

Most of the “framework” pieces are shared between the two apps:

- `packages/app-shared/framework` – common client bootstrap + router implementation.
- `packages/app-shared/scripts/webpackShared.js` – shared webpack layer/babel config.

`packages/app1` and `packages/app2` import from these shared modules via their local `src/framework/*` wrappers and build scripts, so host/remote stay in lockstep without duplicating framework logic while keeping SSR workers and entries app-specific.

### 11.1 Layered Federation & Share Scopes

- All MF plugins use `experiments: { asyncStartup: true }`.
- All shared modules are **async** (`eager: false` everywhere).
- Different webpack layers use distinct share scopes:
  - Client/browser bundles use share scope **`'client'`**.
  - RSC/server bundles use share scope **`'rsc'`**.
- Each shared React package is tagged with:
  - `shareScope: 'client' | 'rsc'`
  - `layer` and `issuerLayer` set to the matching webpack layer (`client`, `rsc`).
- Top-level MF configs initialize share scopes (e.g. `shareScope: ['default', 'client']` or `['default', 'rsc']`) so all relevant scopes are available to the enhanced runtime.

Result: React/ReactDOM (and `react-server-dom-webpack` on the server) behave as **singletons per layer**, avoiding cross-layer confusion while still allowing federation.

### 11.2 Client-Side Federation (App2 → App1)

Client config snippets (`packages/app2/scripts/build.js`, `packages/app1/scripts/build.js`):

- **App2 (remote)**:
  - `ModuleFederationPlugin({ name: 'app2', filename: 'remoteEntry.client.js', exposes: { './Button': './src/Button.js', './DemoCounterButton': './src/DemoCounterButton.js', './server-actions': './src/server-actions.js' }, shareScope: ['default', 'client'] })`
- **App1 (host)**:
  - `ModuleFederationPlugin({ name: 'app1', remotes: { app2: 'app2@http://localhost:4102/remoteEntry.client.js' }, shareScope: ['default', 'client'] })`

Key behaviors:

- `RemoteButton` in `app1` does `React.lazy(() => import('app2/Button'))`, which:
  - Loads `remoteEntry.client.js` from `app2` at runtime.
  - Uses the **client** share scope so React is a singleton across apps.
- `FederatedActionDemo` in `app1` does `import('app2/server-actions')`:
  - The RSC client loader in `app2` has already transformed `'use server'` exports into `createServerReference` stubs.
  - From the browser’s perspective this behaves like any other server action stub; the difference is that its manifest ID points at `app2`.

All client‑side imports use **standard `import()`** – there are no `/* webpackIgnore */` magic comments.

### 11.3 RSC Server Federation (Node Containers)

On the RSC/server side, each app has an MF container in the **`rsc`** layer:

- **App2** builds `app2-remote.js` (`remoteType: 'commonjs-module'`) and exposes:
  - `./Button`, `./DemoCounterButton` (RSC or client-ref compatible components).
  - `./server-actions` (RSC server actions module).
- **App1** configures a server‑side MF host:
  - `remotes: { app2: 'commonjs-module <absolute path>/packages/app2/build/app2-remote.js' }`.
  - Shared packages: `react`, `react-dom`, `react-server-dom-webpack` as **rsc-layer singletons**.

This enables:

- Loading app2’s RSC components into app1’s **server.rsc.js** bundle.
- Sharing the same React/RSDW instances across the federation boundary in the RSC layer.
- Future “Option 2” work, where remote `'use server'` actions could be executed in‑process via MF instead of via HTTP.

### 11.4 Federated Server Actions – Option 1 (HTTP Forwarding)

Current cross‑app server actions use **Option 1: HTTP forwarding** from app1 → app2.

Flow (simplified):

1. On the client, an action from `app2/server-actions` is called inside `FederatedActionDemo` in `app1`.
2. The action stub’s ID includes information that matches `app2` (e.g. a file path under `packages/app2/`).
3. App1’s `/react` POST handler reads the `rsc-action` header and calls `getRemoteAppForAction(actionId)`:
   - `REMOTE_APP_CONFIG` defines patterns for `app2` (explicit `^remote:app2:` prefix plus path‑based fallbacks).
   - If a match is found, `getRemoteAppForAction`:
     - Returns the remote config (`url`, patterns).
     - **Strips the `remote:app2:` prefix**, producing a **forwarded ID** that matches app2’s manifest keys (plain `file://…#name`).
4. If `remoteApp` is returned, app1 calls `forwardActionToRemote(req, res, forwardedId, config)` instead of executing the action locally.

The forwarder in `packages/app1/server/api.server.js`:

- Builds `targetUrl = '<APP2_URL>/react'` and preserves query parameters (e.g. `location=…`).
- Buffers the request body.
- Starts from **all original request headers** (`{ ...req.headers }`) so:
  - `cookie`, `authorization`, CSRF headers, etc. are preserved.
  - `content-length`, `connection`, and `host` are removed/overridden for safety.
- Sets `headers['rsc-action'] = forwardedActionId` so app2 sees the **manifest ID without the `remote:app2:` prefix**.
- Forwards the request via `fetch(targetUrl, { method: 'POST', headers, body })`.
- Copies the remote response headers back to the client, excluding hop‑by‑hop headers (`content-encoding`, `transfer-encoding`, `connection`), and streams the body.

This keeps the RSC Flight protocol intact while allowing **federated server actions** to run in `app2` using the original browser cookies and auth context.

### 11.5 Federated Server Actions – Option 2 (In‑Process MF, Design)

Option 2 avoids the HTTP hop by executing remote actions **in the host process** via Module Federation. Conceptually, there are two layers:

- **Build‑time wiring** – make sure app1’s RSC bundle *imports* app2’s `'use server'` modules from the MF container so they can register with the host RSC runtime.
- **Runtime lookup** – make `getServerAction(actionId)` in app1 return a function that internally calls into the MF remote instead of doing an HTTP forward.

At a high level, the pieces look like this:

1. **Import remote actions in app1’s RSC bundle**

   In `packages/app1/src/server-entry.js` (RSC layer), app1 would import app2’s actions via MF:

   ```js
   // PSEUDOCODE – not wired yet
   import * as App2Actions from 'app2/server-actions';

   export function registerRemoteActions() {
     // Just referencing this ensures webpack includes the MF remote
     return App2Actions;
   }
   ```

   Because the RSC `ModuleFederationPlugin` for app1’s server bundle already declares:

   ```js
   remotes: {
     app2: 'commonjs-module /absolute/path/to/app2/build/app2-remote.js',
   }
   ```

   webpack can resolve `'app2/server-actions'` to the Node MF container (`app2-remote.js`).

2. **Register remote actions in the host’s serverActionRegistry**

   `rsc-server-loader.js` currently:

   - Detects `'use server'` at the file level.
   - Appends `registerServerReference(fn, moduleUrl, exportName)` calls to each export.

   For MF‑imported remotes, we want those calls to register **into app1’s registry**, but keep the original action ids that clients already use (e.g. `file:///.../packages/app2/src/server-actions.js#incrementCount`).

   Concretely, the loader would need to:

   - Detect that the current module is a federated remote (e.g. based on `resourcePath` or an injected mapping).
   - Use a **canonical remote module URL** when calling `registerServerReference`, instead of app1’s local path:

   ```js
   // PSEUDOCODE inside rsc-server-loader
   const moduleUrl = isFederatedRemote(resourcePath)
     ? 'file:///abs/path/to/packages/app2/src/server-actions.js'
     : url.pathToFileURL(resourcePath).href;
   ```

   This keeps action ids stable across both Option 1 and Option 2.

3. **Merge remote actions into app1’s server‑actions manifest**

   `react-server-dom-webpack-plugin.js` already:

   - Scans for file‑level `'use server'` modules.
   - Reads the shared `inlineServerActionsMap`.
   - Emits `react-server-actions-manifest.json` for the server bundle.

   Once MF‑imported remotes run through `rsc-server-loader`, their actions look like “just more actions” to the plugin. No extra manifest merge is strictly required if:

   - app1’s build actually imports `'app2/server-actions'`, and
   - the loader emits `registerServerReference` calls with the canonical `moduleUrl` (see above).

   As a fallback, app1 could also read app2’s own `react-server-actions-manifest.json` at build time and merge it into its own manifest, but the preferred path is to let the loader + plugin treat remote modules the same as local modules.

4. **Host RSC runtime prefers MF‑native actions over HTTP forwarding**

   In `packages/app1/server/api.server.js` app1 currently:

   - Reads the action id from the `rsc-action` header.
   - Uses `getRemoteAppForAction(id)` to decide whether to forward to app2 over HTTP.
   - Uses `server.getServerAction(id)` to find local actions.

   With Option 2 in place, the lookup order becomes:

   1. Try `server.getServerAction(actionId)`:
      - If the action was MF‑imported and registered via `rsc-server-loader`, this returns a callable function that internally jumps across the MF boundary.
   2. If no registered function exists but `getRemoteAppForAction(actionId)` matches, fall back to **Option 1 (HTTP forwarding)** as a safety net.

   This means both options can co‑exist:

   - **Option 2 (MF‑native)** for remotes that are wired into the host’s RSC bundle.
   - **Option 1 (HTTP)** for remotes that are not yet MF‑enabled or for failure scenarios where MF can’t load the remote container.

> Status: the codebase today implements **Option 1 (HTTP forwarding)** end‑to‑end and has tests for it. Option 2 is an architectural design that the RSDW plugin/loader were structured to support, but it is **not wired up yet** – enabling it would require the changes outlined above.

The new unit tests in `packages/e2e/rsc/server.federation.test.js` and Playwright tests in `packages/e2e/e2e/mf.apps.e2e.test.js` validate:

- Remote ID pattern detection and prefix handling.
- Existence and loading of MF server bundles (`app2-remote.js`, `server.rsc.js`).
- Correct header handling and URL construction for forwarding.
- End‑to‑end behavior of `FederatedActionDemo` and other MF demos.
