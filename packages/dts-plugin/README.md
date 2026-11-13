# @module-federation/dts-plugin

## Framework build notifications

`createDevBuildConnection` lets a framework publish a ready development build and subscribe to its remote providers through the existing federation development broker. It is also exported from `@module-federation/enhanced` and `@module-federation/enhanced/rspack`.

The connection runs in a worker and does not generate or download types. It works independently of `dts: false`. It does not trigger browser reloads.

<!-- prettier-ignore -->
```ts
import { createDevBuildConnection } from '@module-federation/dts-plugin'

const remote = {
  name: 'catalog',
  entry: 'http://localhost:3001/mf-manifest.json',
}

const connection = createDevBuildConnection(
  {
    publisher: {
      name: 'store',
      entry: 'http://localhost:3000/mf-manifest.json',
    },
    remotes: [remote],
  },
  {
    async onUpdate(update, { signal }) {
      await prepareRemoteGeneration(update, signal)
    },
    onError(error) {
      console.error(error)
    },
  },
)
```

`prepareRemoteGeneration` is the framework's asynchronous update operation. Complete it only after the replacement Node generation is ready. Until it completes successfully, `connection.isSynchronized(remote)` returns `false`. An initial subscription and every reconnection replay the provider's latest ready publication through this same callback.

Call `connection.invalidate()` when compilation starts. After publishing the manifest, assets and framework resources, call `connection.publish({ buildVersion, devRevision })` with the manifest's build information. A framework that forwards dependency changes can include `sources`, an array of `{ name, entry, buildVersion, devRevision }`, preserving the original nested provider's revision even when its own build version is unchanged. `devRevision` is optional for compatibility with production manifests and older publishers.

Publications and their sources may include `hot: true` when their browser artifacts have a live HMR transport. An omitted or false value gives no HMR guarantee. A forwarding framework should advertise this capability only if its own artifacts and every applied dependency support it. The framework still coordinates browser data revalidation or reload after its Node update completes.

Subscriptions use the provider name and complete manifest URL. Different ports and paths remain separate providers. `onStatus` reports `disconnected`, `unsupported`, `waiting`, `updating` or `ready`. An unavailable producer, an older broker, a failed update or a lost connection must keep the framework's request-time fallback enabled. These notifications do not discover builds served without a compatible development producer.

The default broker uses WebSocket port 16322 on the provider's host. `brokerUrl` on a publisher or remote overrides that address. Local brokers start automatically unless `autoStartBroker: false` is set. Call and await `connection.close()` when the owning service stops to unsubscribe, abort the callback signal and release the worker.

## Development diagnostics

The broker keeps recent connection, publication, notification and reported update results in memory, even when `FEDERATION_DEBUG` is unset. It retains at most 2,000 entries and 2 MiB of serialized records. Oversized individual entries are truncated. Heartbeats, repeated subscriptions and duplicate publications do not add noise. Logs describe this broker's lifetime and disappear when it exits or restarts.

Read the logs through the broker's existing HTTP port. No log file needs to be located or opened:

```sh
curl 'http://127.0.0.1:16322/__mf/logs?limit=100'
curl 'http://127.0.0.1:16322/__mf/logs?consumer=store&remote=catalog'
```

`limit` defaults to 100 and is capped at 500. Without `after`, the endpoint returns the latest matching entries. Pass the response's `nextCursor` as `after` to read subsequent entries without repeating earlier results. When `hasMore` is true, continue reading with the returned cursor. Exact-match filters are `source`, `consumer` and `remote`, where `remote` accepts a remote name or its full manifest URL.

Responses contain `brokerId`, `entries`, `nextCursor`, `hasMore`, `truncated` and `reset`. Each entry includes its timestamp, source, level, message and available operation context. `truncated` indicates omitted history, including records evicted by the memory limits. An individual entry can also have `truncated: true`. `reset` means the supplied cursor belongs to a previous broker instance or no longer describes the current stream. A filtered response is only a view of this broker, not a global view of every development application.

The HTTP route accepts local requests only and rejects cross-origin browser requests. For a remote broker, run the request on that machine or use a localhost tunnel. A remote broker URL is not automatically accessible through this local-only diagnostic route.

Use `onDiagnostics` to discover the actual endpoint instead of assuming a port. The callback is only called for brokers advertising this capability, and the URL belongs to the connected broker:

```ts
onDiagnostics({ url }) {
  console.info(`[MF] logs: ${url}`)
}
```

Frameworks should set the connection's `consumer` name and call `connection.reportResult(remote, result)` after an update actually completes or fails. A result uses `outcome: 'applied' | 'failed'` and `trigger: 'notification' | 'manifest'`, with optional `buildVersion`, `operationId`, `stage`, `timingsMs` and `error`. No-op checks need no result. Report manifest-check results as well as subscription results. Transport acknowledgements alone do not prove that an update was applied. Diagnostic callbacks, delivery failures and log-file errors must not interrupt the update path.

Setting `FEDERATION_DEBUG` before the broker starts additionally writes its diagnostics to the existing `.mf/typesGenerate.log` in the broker's working directory. Memory queries remain available in this mode. Other DTS workers keep their existing local file behavior, and restarting a DTS worker no longer removes that shared file. The broker inherits its environment from the first application that starts it, so changing another application's environment does not change a running broker. Worker-internal type compilation and download logs are not automatically collected by this endpoint.
