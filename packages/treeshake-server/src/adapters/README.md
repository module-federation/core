# Adapters

The server (`@module-federation/treeshake-server`) is adapter-driven. Adapters implement the core "ports":

- `src/ports/objectStore.ts`: object store used for cache checks + artifact uploads
- `src/ports/projectPublisher.ts`: optional publisher used to mirror artifacts into a project-owned CDN

The goal is to keep `src/services/*` free of vendor-specific dependencies.

## Where adapters live

Concrete adapter implementations live inside this package:

- `src/adapters/local`: filesystem-backed `ObjectStore` (default for local usage)

## OSS registry

`@module-federation/treeshake-server` provides `createOssAdapterRegistry()` which registers `local`.
