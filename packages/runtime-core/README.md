# @module-federation/runtime

- Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
- Only consume part of the export of the remote module and will not fully download the remote module
- The runtime calling process can be extended through the module-runtime plug-in mechanism

## Documentation

See [https://module-federation.io/guide/runtime/index.html](https://module-federation.io/guide/runtime/index.html) for details.

## Explicit SSR remote updates

`instance.updateRemotes(remotes)` asynchronously replaces the named registrations
and preserves registrations omitted from the batch. It captures and validates
the input, serializes updates on the instance, and awaits the `removeRemote`
hooks before registering replacements. An explicit update of the same manifest
URL also clears its cached snapshot. Cleanup failures reject the returned promise.
The batch is preflighted, but cleanup is not transactional across multiple remotes.

`instance.removeRemote(nameOrAlias)` awaits the same cleanup hooks.
`instance.destroy()` closes admission to that instance, waits for its tracked
runtime operations, and releases its owned caches and plugins. Disposal is
irreversible, even when cleanup fails. Shared factories still used by another
consumer are retained.

The application must stop admission and drain its SSR requests and producer work
before updating or destroying a runtime. These APIs do not detect deployments,
watch a producer, reload browser sessions, or coordinate independent MF instances.
Bare `updateRemotes` or bundler `clearCache` calls do not preserve business requests
that the caller has not drained. Invalidation can reject pending chunk loads as
stale, preventing old asynchronous work from restoring the retired cache.
Bundled SSR imports additionally require the bundler cache adapter and compatible
compiler dependency metadata. Updating registrations alone cannot invalidate
bundled application closures or replace references retained by application code.

`registerRemotes(remotes, { force: true })` retains its synchronous legacy
behavior. It does not await the new asynchronous cleanup hooks. Applications that
coordinate SSR invalidation should use and await `updateRemotes`.

## License

`@module-federation/runtime` is [MIT licensed](https://github.com/module-federation/core/blob/main/packages/runtime/LICENSE).
