# @module-federation/runtime

- Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
- Only consume part of the export of the remote module and will not fully download the remote module
- The runtime calling process can be extended through the module-runtime plug-in mechanism

## Documentation

See [https://module-federation.io/guide/runtime/index.html](https://module-federation.io/guide/runtime/index.html) for details.

### Shared layers

Providers and consumers can select a variant with `shareConfig.layer`. Within a share scope, providers with the same package name and version remain independent across layers. A consumer uses its exact layer when available, including that layer's existing version and singleton negotiation. It can use an unlayered provider only when no provider exists for its requested layer; an incompatible version in an existing layer does not select an unlayered provider. Unlayered consumers never select layered providers.

Unlayered share-scope entries retain their existing shape and can be exchanged with older Federation runtimes. Layer variants are carried on the share-scope object by reference through normal container initialization; copying or serializing that object does not preserve them. A layered-only provider stays invisible to older unlayered lookup, which can still use its local fallback. Layer negotiation requires participating runtimes to understand layers; applications without layers do not need to upgrade their other Federation runtimes.

## License

`@module-federation/runtime` is [MIT licensed](https://github.com/module-federation/core/blob/main/packages/runtime/LICENSE).
