# node-esm-remote

A Node.js Module Federation **remote** built by webpack
(`@module-federation/enhanced`) with **native ESM output**:

```js
target: 'node20',
experiments: { outputModule: true },
output: {
  module: true,
  chunkFormat: 'module',
  chunkLoading: 'import',          // async chunks use native import()
  library: { type: 'module' },     // remoteEntry.mjs exports { get, init }
  publicPath: 'http://localhost:3030/',
  environment: { module: true, dynamicImport: true },
}
```

and in the plugin: `new ModuleFederationPlugin({ name: 'node_esm_remote',
filename: 'remoteEntry.mjs', library: { type: 'module' }, exposes: { './greeting': './src/greeting.js' } })`.

This intentionally does **not** use `target: 'async-node'`,
`StreamingTargetPlugin`, or the vm-based `@module-federation/node` runtime
plugin — chunks are plain ES modules loaded via `import()`, so a host running
with http(s) loader hooks (see [`apps/node-esm-host`](../node-esm-host/README.md))
loads everything through Node's native module loader.

The exposed `./greeting` module contains a dynamic `import()` of
`deep-thought.js`, so consuming it exercises real async ESM chunk loading over
http, not just the remote entry.

## Usage

```bash
pnpm --filter node-esm-remote run build
pnpm --filter node-esm-remote run serve   # node:http static server for dist/ on :3030
```

The server sets `Content-Type: text/javascript` for `.js`/`.mjs` and logs each
request so you can watch the host fetch the entry and chunks.
