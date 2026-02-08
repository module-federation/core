import 'mf:async-require';

import { loadSharedToRegistry } from 'mf:remote-module-registry';
import { init as runtimeInit } from '@module-federation/runtime';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
__PLUGINS__;

const usedRemotes = __REMOTES__;
const usedShared = __SHARED__;

const exposesMap = __EXPOSES_MAP__;

function get(moduleName) {
  if (!(moduleName in exposesMap)) {
    throw new Error(`Module ${moduleName} does not exist in container.`);
  }
  return exposesMap[moduleName]().then((m) => () => m);
}

const initTokens = {};

const name = __NAME__;
const shareScopeName = 'default';
const shareStrategy = __SHARE_STRATEGY__;

let hmrInitialized = false;

async function init(shared = {}, initScope = []) {
  const instance = runtimeInit({
    name,
    remotes: usedRemotes,
    shared: usedShared,
    plugins,
    shareStrategy,
  });
  // handling circular init calls
  let initToken = initTokens[shareScopeName];
  if (!initToken) {
    initToken = initTokens[shareScopeName] = {
      from: name,
    };
  }
  if (initScope.indexOf(initToken) >= 0) {
    return;
  }
  initScope.push(initToken);
  instance.initShareScopeMap(shareScopeName, shared);

  const initSharingPromise = Promise.all(
    instance.initializeSharing(shareScopeName, {
      strategy: shareStrategy,
      from: 'build',
      initScope,
    }),
  );

  // IMPORTANT: load early shared deps immediately without
  // waiting for the async part of initializeSharing to resolve
  __EARLY_SHARED__.forEach(loadSharedToRegistry);

  await initSharingPromise;

  // setup HMR client after the initializing sync shared deps
  if (__DEV__ && !hmrInitialized) {
    const hmr = require('mf:remote-hmr');
    hmr.setup();
    hmrInitialized = true;
  }

  // load the rest of shared deps
  await Promise.all(Object.keys(shared).map(loadSharedToRegistry));

  return instance;
}

globalThis.__FEDERATION__ ??= {};
globalThis.__FEDERATION__.__NATIVE__ ??= {};
globalThis.__FEDERATION__.__NATIVE__[name] ??= {};

globalThis.__FEDERATION__.__NATIVE__[name].deps ??= {
  shared: {},
  remotes: {},
};

globalThis.__FEDERATION__.__NATIVE__[name].exports = {
  get,
  init,
};
