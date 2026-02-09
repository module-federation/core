import {
  loadRemoteToRegistry,
  loadSharedToRegistry,
} from 'mf:remote-module-registry';
import { init } from '@module-federation/runtime';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
__PLUGINS__;

const usedRemotes = __REMOTES__;
const usedShared = __SHARED__;

const name = __NAME__;
const shareScopeName = 'default';
const shareStrategy = __SHARE_STRATEGY__;

const instance = init({
  name,
  remotes: usedRemotes,
  plugins,
  shared: usedShared,
  shareStrategy,
});

globalThis.__FEDERATION__ ??= {};
globalThis.__FEDERATION__.__NATIVE__ ??= {};
globalThis.__FEDERATION__.__NATIVE__[name] ??= {};
globalThis.__FEDERATION__.__NATIVE__[name].deps ??= {
  shared: {},
  remotes: {},
};

globalThis.__FEDERATION__.__NATIVE__[name].init = Promise.all(
  instance.initializeSharing(shareScopeName, {
    strategy: shareStrategy,
    from: 'build',
    initScope: [],
  }),
).then(() =>
  Promise.all([
    ...Object.keys(usedShared).map(loadSharedToRegistry),
    ...__EARLY_REMOTES__.map(loadRemoteToRegistry),
  ]),
);

// IMPORTANT: load early shared deps immediately without
// waiting for the async part of initializeSharing to resolve
__EARLY_SHARED__.forEach(loadSharedToRegistry);
