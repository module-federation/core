## Verdict (hand-written; run.mjs appends this file to results.md)

All rows are identical on @rspack/core 2.1.8 and 2.1.10 (checked in results.json, ms excluded).

### Q1. Alias the native plugin's absolute .cjs to a composed entry: yes, and VirtualModulesPlugin is the better target

The working calls, from the wrapper's own `apply`, after it applies the native plugin:

- `new compiler.rspack.experiments.VirtualModulesPlugin({ [file]: content }).apply(compiler)`, with `file` = `<context>/node_modules/.federation/rspack/host.<sha12>.mjs`. It must be applied before `afterEnvironment` fires: the plugin records static modules in its `afterEnvironment` tap, and rspack hands them to the native compiler when the JsCompiler instance is created. `writeModule` only works after that.
- `compiler.hooks.afterPlugins.tap(..., () => { compiler.options.resolve.alias = { ...alias, [<abs webpack-bundler-runtime/dist/index.cjs>]: file, '@module-federation/runtime': <abs runtime/dist/index.js> } })`. The key is the exact string the native plugin computes with `require.resolve('@module-federation/webpack-bundler-runtime', { paths: [<runtime-tools bundler.js>] })`. The value is the absolute virtual path. The directory does not need to exist on disk. User-level `resolve.alias` with the same key and value works too (row virtual-user-alias).

Evidence, ALL-OFF+expose, production (M1) and production minimize:false (M2):

- Graph. control-none has `webpack-bundler-runtime/dist/index.cjs` in chunks and 152 federation module entries, all .cjs. Every alias row has the composed module in chunks, no `dist/index.cjs`, `dist/index.js` present, 0 .cjs and 78 ESM federation module entries.
- Smoke. remoteEntry.js creates the instance with `DisabledSharedHandler` / `DisabledRemoteHandler` (minified `Y`/`V` in M1), and `globalThis.__MF_COMPOSED_TAG__` equals the tag written into the composed module. The native bootstrap's `for (key in federation)` copy works with `export default federation`.

Persistent cache (`cache: { type: 'persistent', storage: { type: 'filesystem', directory } }`, one process per build, tags A, B, B, A). A warm build shows `built` = 0 modules in stats, so the cache is hit:

- Virtual module, content-hashed path: every build picks the new path and the new tag. No stale reuse.
- Virtual module, fixed path with changed content: also correct.
- Real file, fixed path, write-then-rename: correct.
- Real file, content-hashed path, old file left on disk: **stale**. Builds 2 and 3 alias to `host.7c86...mjs` but the graph and the emitted JS still carry `host.f1ee...mjs` and tag A. The same happens with a plain user `resolve.alias` change (row file-user-hash). rspack's persistent cache does not key cached resolutions on `resolve.alias`. The cached resolution of the absolute .cjs request stays valid while its target file still exists.
- Real file, content-hashed path, siblings pruned before writing: correct. Deleting the old file invalidates the cached resolution. The virtual path gets this for free because the old virtual path is simply not registered in the next build.

Caveat. The virtual row's freshness depends on the old path disappearing. Anything that keeps an old composed path resolvable (two compilers sharing a directory, a stale real file at a virtual path) reintroduces the stale-alias hazard. A wrapper could also fold the sha into `cache.version`. That was not tested.

### Q2. Resolve exports subpaths with rspack's resolver from the wrapper: yes from `make`, only with explicit conditionNames from `afterEnvironment`

API: `compiler.resolverFactory.get('normal', opts).resolveSync({}, <directory>, <request>)` returns the path string (it throws `RspackResolver(NotFound(...))` on a miss). The `_context` argument is ignored.

- `make`: `{ dependencyType: 'esm' }` resolves `@module-federation/runtime/core` to `dist/core.js` and `@module-federation/webpack-bundler-runtime` to `dist/index.js`. `{ dependencyType: 'commonjs' }` and `{}` resolve them to the `.cjs` files. The bare `@module-federation/runtime` always resolves to `dist/index.cjs`, because the native plugin's non-`$` alias applies. `/bundler` is a plain string export, so it resolves to `dist/bundler.js` under every condition.
- `afterEnvironment`: `dependencyType` is ignored. esm, commonjs and `{}` all return the `.js` files, so `import` wins only by accident. The native binding's resolver factory was built in the `Compiler` constructor from the pre-defaults options, before `byDependency` defaults and plugin aliases existed. Spreading `compiler.options.resolve.byDependency.esm` (already defaulted by then) or `.commonjs` into the options gives the right `.js` / `.cjs` split. Plugin aliases are still not applied, so the bare runtime resolves to `dist/index.js` here.
- Hazard: `ResolverFactory.get` caches by `JSON.stringify(opts)`. A `get('normal', { dependencyType: 'esm' })` made in `afterEnvironment` returns the same stale resolver in `make`: 24 of 75 `make` results change between q2-afterEnvironment+make and q2-make-only. The compilation's own module resolution is unaffected (both q2 builds match control-none).
- Self-reference works. `@module-federation/webpack-bundler-runtime` resolves from `packages/webpack-bundler-runtime`, which has no node_modules entry for itself. The same holds for `@module-federation/runtime/core` from `packages/runtime`.
