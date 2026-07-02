# node-esm-host

A Node.js Module Federation **host** whose bundle is native ESM and whose
remote (entry _and_ async chunks) is loaded over http through **Node's own
module loader** — dynamic `import()` plus the loader hooks registered by
`@module-federation/node/register`. No `target: 'async-node'`, no
`StreamingTargetPlugin`, no vm-based chunk evaluation.

Pairs with [`apps/node-esm-remote`](../node-esm-remote/README.md).

## How it works

1. The host is built by webpack as an ES module (see webpack options below)
   with `@module-federation/runtime` and `@module-federation/node/runtimePlugin`
   bundled in.
2. At runtime the process is started with
   `node --import @module-federation/node/register dist/main.mjs`, which calls
   `module.register()` from `node:module` to install the package's http(s)
   `resolve`/`load` hooks (see
   `packages/node/docs/native-http-loader-design.md`).
3. The node runtime plugin's `loadEntry` bridge handles remotes declared with
   `type: 'module'`: it **allowlists the remote's origin** with the hooks
   thread, then loads the entry with a native `import(remoteInfo.entry)`.
   This is needed because in a Node environment the runtime's default path
   (`loadEntryNode` in `runtime-core`) evaluates entries in a vm context
   instead of using the native loader.
4. Once the remote entry is imported over http, all of the remote's own
   `import()` chunk loads are URLs resolved against the http parent — the
   loader hooks fetch those too (same-origin, already allowlisted). Nothing
   federation-specific is needed for chunk loading; it's just Node ESM
   semantics.

### Allowlisting

The loader hooks refuse http(s) origins that were not explicitly allowed.
This example needs no configuration because the runtime plugin allowlists
each registered remote's origin automatically before importing it. To allow
extra origins that are not registered remotes (or when not using the runtime
plugin), seed the allowlist via the environment:

```bash
MF_NODE_NATIVE_LOADER_HOSTS=http://localhost:3030 \
  node --import @module-federation/node/register dist/main.mjs
```

### Why no local `loadEntry` plugin?

An earlier revision of this example shipped its own loader hooks and a small
`loadEntry` runtime plugin. Both are superseded by the package exports: the
`node-federation-plugin` returned by `@module-federation/node/runtimePlugin`
implements the same `loadEntry` bridge (plus origin allowlisting), and
`@module-federation/node/register` ships the real hooks. Hosts using
`@module-federation/runtime` directly just add the plugin to `plugins: []`.

## Key webpack options (both apps)

```js
target: 'node20',
experiments: { outputModule: true },
output: {
  module: true,
  chunkFormat: 'module',
  chunkLoading: 'import',
  library: { type: 'module' },
  environment: { module: true, dynamicImport: true },
}
```

Why not `target: 'async-node'`: that target makes webpack emit CommonJS-style
chunks fetched by custom runtime code and evaluated with `vm` (via
`@module-federation/node`'s chunk-loading patch). Here chunks are real ES
modules loaded by Node itself, so http support comes from standard loader
hooks instead of federation-specific fetch/eval machinery.

## Run it

```bash
# 1. Build and serve the remote (terminal 1)
pnpm --filter node-esm-remote run build
pnpm --filter node-esm-remote run serve   # serves dist/ on http://localhost:3030

# 2. Build + run the host (terminal 2)
pnpm --filter node-esm-host run demo
# or separately:
pnpm --filter node-esm-host run build
pnpm --filter node-esm-host run start
```

Expected host output:

```
[node-esm-host] loadRemote result: [node-esm-remote] Hello node-esm-host! The answer is 42 (computed in an async ESM chunk).
[node-esm-host] SUCCESS: remote entry + async chunk loaded via native ESM import() over http
```

And the remote's server log proves the entry, the exposed module's chunk, and
the remote's _nested_ async chunk (`deep-thought`) were all fetched over http
by Node's native loader:

```
[node-esm-remote:server] GET /remoteEntry.mjs
[node-esm-remote:server] GET /__federation_expose_greeting-<hash>.mjs
[node-esm-remote:server] GET /src_deep-thought_js-<hash>.mjs
```
