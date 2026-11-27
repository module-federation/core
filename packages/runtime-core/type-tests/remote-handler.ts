import type { ModuleFederation } from '../dist/core.js';
import { RemoteHandler } from '../dist/remote/index.js';
import type { DisabledRemoteHandler } from '../src/remote/disabled';

// Check the actual disabled implementation against the built enabled contract.
declare const disabled: DisabledRemoteHandler;
declare const handler: RemoteHandler | DisabledRemoteHandler;
declare const origin: ModuleFederation;
const payload = {
  origin,
  loaderHook: origin.loaderHook,
  remoteInfo: {
    name: 'fallback',
    entry: 'fallback.js',
    type: 'global',
    entryGlobalName: 'fallback',
    shareScope: 'default',
  },
} satisfies Parameters<typeof disabled.hooks.lifecycle.loadEntry.emit>[0];

const container = { get: () => async () => ({}), init: () => undefined };
disabled.hooks.lifecycle.loadEntry.on(() => container);
disabled.hooks.lifecycle.loadEntry.on(async () => container);
disabled.hooks.lifecycle.loadEntry.on(() => undefined);
disabled.hooks.lifecycle.loadEntry.emit(payload);
handler.hooks.lifecycle.loadEntry.emit(payload);

// @ts-expect-error loadEntry requires origin, loaderHook, and remoteInfo.
disabled.hooks.lifecycle.loadEntry.emit({});
// @ts-expect-error remoteInfo cannot be replaced by a request string.
disabled.hooks.lifecycle.loadEntry.emit({ ...payload, remoteInfo: 'fallback' });
const incompatibleListener = (args: { remoteInfo: string }) => undefined;
// @ts-expect-error listeners cannot consume an incompatible payload.
disabled.hooks.lifecycle.loadEntry.on(incompatibleListener);
// @ts-expect-error a container must expose get and init.
disabled.hooks.lifecycle.loadEntry.on(() => ({ get: () => () => ({}) }));
// @ts-expect-error async listeners must also return a valid container or void.
disabled.hooks.lifecycle.loadEntry.on(async () => 42);
// @ts-expect-error disabled handlers do not implement beforeRequest.
disabled.hooks.lifecycle.beforeRequest;
// @ts-expect-error disabled handlers do not implement errorLoadRemote.
disabled.hooks.lifecycle.errorLoadRemote;
// @ts-expect-error disabled handlers cannot satisfy the full handler contract.
const fullHandler: RemoteHandler = disabled;
// @ts-expect-error enabled-only hooks require narrowing the honest union.
handler.hooks.lifecycle.beforeRequest;

if (handler instanceof RemoteHandler) {
  handler.hooks.lifecycle.beforeRequest.emit({
    id: 'remote/expose',
    origin,
    options: origin.options,
  });
}
