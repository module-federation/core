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

Call `connection.invalidate()` when compilation starts. After publishing the manifest, assets and framework resources, call `connection.publish({ buildVersion })` with the manifest's build version. A framework that forwards dependency changes can include `sources`, an array of `{ name, entry, buildVersion }`, preserving the original nested provider's identity even when its own build version is unchanged.

Publications and their sources may include `hot: true` when their browser artifacts have a live HMR transport. An omitted or false value gives no HMR guarantee. A forwarding framework should advertise this capability only if its own artifacts and every applied dependency support it. The framework still coordinates browser data revalidation or reload after its Node update completes.

Subscriptions use the provider name and complete manifest URL. Different ports and paths remain separate providers. `onStatus` reports `disconnected`, `unsupported`, `waiting`, `updating` or `ready`. An unavailable producer, an older broker, a failed update or a lost connection must keep the framework's request-time fallback enabled. These notifications do not discover builds served without a compatible development producer.

The default broker uses WebSocket port 16322 on the provider's host. `brokerUrl` on a publisher or remote overrides that address. Local brokers start automatically unless `autoStartBroker: false` is set. Call and await `connection.close()` when the owning service stops to unsubscribe, abort the callback signal and release the worker.
