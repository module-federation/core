# @module-federation/runtime

- Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
- Only consume part of the export of the remote module and will not fully download the remote module
- The runtime calling process can be extended through the module-runtime plug-in mechanism

## Documentation

See [https://module-federation.io/guide/runtime/index.html](https://module-federation.io/guide/runtime/index.html) for details.

## Lifecycle hooks and Node SSR ownership

Generic runtime instances stay minimal and only expose lifecycle hooks (`removeRemote` and `dispose`) plus build-aware provider resolution (`helpers.global.getRemoteFederationInstance`).

SSR remote replacement, removal, load draining, and whole-instance teardown live in `@module-federation/node`. Install `@module-federation/node/runtimePlugin`, which attaches serialized `updateRemotes(remotes)` and `removeRemote(nameOrAlias)` onto the Node instance, and exposes `updateNodeRemotes`, `removeNodeRemote`, and `destroyNodeInstance` through `@module-federation/node/lifecycle`.

Core exposes a `dispose({ origin })` hook for resource owners. The lifecycle owner calls `helpers.dispose.notifyDispose(instance)` after draining work and before removing the instance's remaining roots. `registerRemotes(remotes, { force: true })` retains its synchronous legacy behavior in CSR.

`helpers.global.getRemoteFederationInstance(remoteInfo, instances?)` resolves a provider by `name:buildVersion` against `instance.options.id` when `buildVersion` is present, falling back to `name` only when unversioned. Runtime `init` also respects an explicit instance ID or the compiler's build ID.

## License

`@module-federation/runtime` is [MIT licensed](https://github.com/module-federation/core/blob/main/packages/runtime/LICENSE).
