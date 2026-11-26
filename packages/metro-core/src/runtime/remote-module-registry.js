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

// this container provides an eager shared module synchronously
function isEagerShared(id) {
  const shared = getInstance()?.options.shared[id];
  return shared?.some(({ shareConfig }) => shareConfig?.eager) ?? false;
}

export function getModuleFromRegistry(id) {
  const module = registry[id];

  if (!module) {
    throw new Error(`Module ${id} not found in registry`);
  }

  // Only react and react-native load synchronously, but the host entry, or
  // another shared module, can require any eager shared module before its
  // async load finishes. Load it now instead of returning the empty
  // placeholder. The module is cloned before the flag is cleared, so the
  // async load still fills the placeholder if the factory throws.
  if (pendingShared.has(id) && isEagerShared(id)) {
    cloneModule(loadShareSync(id)(), module);
    pendingShared.delete(id);
  }

  return module;
}
