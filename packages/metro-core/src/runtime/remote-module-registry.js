import {
  loadRemote,
  loadShare,
  loadShareSync,
} from '@module-federation/runtime';

const registry = {};
const loading = {};

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
    loading[id] = (async () => {
      const factory = await loadShare(id);
      const sharedModule = factory();
      cloneModule(sharedModule, registry[id]);
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

export function getModuleFromRegistry(id) {
  const module = registry[id];

  if (!module) {
    throw new Error(`Module ${id} not found in registry`);
  }

  return module;
}
