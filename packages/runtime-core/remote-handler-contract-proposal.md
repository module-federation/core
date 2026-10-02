# Honest remote handler contract

PR5143's real `loadEntry` hook, derived with `Pick<RemoteHandler['hooks']['lifecycle'], 'loadEntry'>`, is sufficient for shared fallback loading. Keep that fix unchanged.

`ModuleFederation.remoteHandler` is publicly declared as `RemoteHandler`. Its constructor asserts a `DisabledRemoteHandler` to that full type, although the disabled implementation has only `loadEntry`. Removing the assertion requires changing the public property contract; a private adapter cannot truthfully preserve access to the enabled-only hooks.

A trial `RemoteHandler | DisabledRemoteHandler` property and assertion-free assignment produced six additional compiler errors: `handlePreloadModule` in generate-preload-assets, `beforePreloadRemote` and `generatePreloadAssets` in the snapshot plugin, and `errorLoadRemote` in both SnapshotHandler sites and SharedHandler. External runtime plugins receive the same property through their `origin`. They would also have to narrow before accessing enabled-only hooks. This crosses the requested public API/optimization boundary, so no production refactor is included here.

A future API change can expose that union and narrow enabled-only operations with a capability guard. Keep `loadEntry` common to both implementations, derive its type from the enabled handler, and retain disabled methods' explicit errors. Review the generated declarations and disabled build elimination before adopting the change. Do not supply absent hooks as no-ops or conceal the difference with another assertion.

The regression checks the actual internal DisabledRemoteHandler source against the built enabled declarations (the disabled class has no emitted declaration): valid synchronous and asynchronous containers compile; malformed payloads, incompatible callbacks, invalid container results, and unavailable disabled capabilities must fail. It also demonstrates narrowing the union. The existing disable-remote runtime suite covers the platform loader, plugin loader, disabled loadRemote, and the real shared fallback consumer. The new type tests do not claim that the host property assertion has been removed.
