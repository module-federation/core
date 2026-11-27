import {
  getInstance,
  loadRemote,
  loadShare,
  loadShareSync,
} from '@module-federation/runtime';

const registry = {};
const loading = {};
// shared modules whose async load handed out a placeholder that isn't filled yet
const pendingShared = new Set();

const earlyModuleTest = __EARLY_MODULE_TEST__;

function cloneModule(module, target) {
  for (const key of Object.getOwnPropertyNames(module)) {
    const descriptor = Object.getOwnPropertyDescriptor(module, key);
    Object.defineProperty(target, key, descriptor);
  }
}

export async function loadAndGetShared(id) {
  await loadSharedToRegistry(id);
  return getModuleFromRegistry(id);
}

export async function loadAndGetRemote(id) {
  await loadRemoteToRegistry(id);
  return getModuleFromRegistry(id);
}

export async function loadRemoteToRegistry(id) {
  const promise = loading[id];
  if (promise) {
    await promise;
  } else {
    registry[id] = {};
    loading[id] = (async () => {
      const remoteModule = await loadRemote(id);
      cloneModule(remoteModule, registry[id]);
    })();
    await loading[id];
  }
}

export function loadSharedToRegistry(id) {
  if (earlyModuleTest.test(id)) {
    return loadSharedToRegistrySync(id);
  }
  return loadSharedToRegistryAsync(id);
}

export async function loadSharedToRegistryAsync(id) {
  const promise = loading[id];
  if (promise) {
    await promise;
  } else {
    registry[id] = {};
    pendingShared.add(id);
    loading[id] = (async () => {
      const factory = await loadShare(id);
      // a synchronous require may have loaded it in the meantime
      if (!pendingShared.has(id)) {
        return;
      }
      cloneModule(factory(), registry[id]);
      pendingShared.delete(id);
    })();
    await loading[id];
  }
}

export function loadSharedToRegistrySync(id) {
  if (loading[id]) {
    return;
  }
  loading[id] = loadShareSync(id);
  registry[id] = loading[id]();
}

// Whether loading a shared module synchronously gives the provider that its
// async load gives. This container has to provide the module synchronously,
// which it does when it shares it eagerly. And every provider registered for
// it has to be eager, or loaded already: the async load can select one that
// is neither, while a synchronous load can only fall back to this
// container's copy, and a singleton would then have two instances.
function canLoadSharedSync(id) {
  const instance = getInstance();
  const shared = instance?.options.shared[id];
  if (!shared?.some(({ shareConfig }) => shareConfig?.eager)) {
    return false;
  }
  return shared.every(({ scope }) =>
    scope.every((scopeName) =>
      Object.values(instance.shareScopeMap[scopeName]?.[id] ?? {}).every(
        (provider) => provider.lib || provider.shareConfig?.eager,
      ),
    ),
  );
}

// Only react and react-native load synchronously, but the host entry, or
// another shared module, can require any eager shared module before its async
// load finishes. This loads it then, instead of leaving the empty placeholder.
export function loadPendingSharedToRegistrySync(id) {
  if (!pendingShared.has(id) || !canLoadSharedSync(id)) {
    return;
  }
  // the flag is cleared once the module is cloned, so a module that throws
  // while it loads isn't taken as loaded, and its async load fails as well
  cloneModule(loadShareSync(id)(), registry[id]);
  pendingShared.delete(id);
}

export function getModuleFromRegistry(id) {
  const module = registry[id];

  if (!module) {
    throw new Error(`Module ${id} not found in registry`);
  }

  return module;
}
