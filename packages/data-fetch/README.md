# @module-federation/data-fetch

Framework-agnostic data fetching utilities for Module Federation: SSR data loaders, caching, prefetch, and the `autoFetchDataPlugin` runtime plugin.

`@module-federation/bridge-react` and `@module-federation/bridge-vue3` re-export these APIs for backward compatibility. Prefer importing from this package for framework-agnostic usage.

## Installation

```bash
pnpm add @module-federation/data-fetch
```

Optional peers:

- `@module-federation/runtime` — required only when registering `autoFetchDataPlugin`
- `hono` — required only for the server middleware entry

## Main imports

```ts
// Core APIs and runtime plugin
import { autoFetchDataPlugin, callDataFetch, cache, configureCache, prefetch, flushDataFetch, setSSREnv } from '@module-federation/data-fetch';

// Subpath entry points
import {} from /* ... */ '@module-federation/data-fetch/data-fetch-utils';
import dataFetchServerMiddleware from '@module-federation/data-fetch/server-middleware';
import { SizeLimitedCache } from '@module-federation/data-fetch/size-limited-cache';
import {} from /* ... */ '@module-federation/data-fetch/utils';
```

## Bridge re-exports

Existing bridge entry points remain available:

```ts
import { callDataFetch, prefetch } from '@module-federation/bridge-react/data-fetch';
```
