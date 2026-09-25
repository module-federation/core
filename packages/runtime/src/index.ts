import {
  ModuleFederation,
  type UserOptions,
  CurrentGlobal,
  assert,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
import { runtimeDescMap, RUNTIME_009 } from '@module-federation/error-codes';
import {
  createInstance as createInstanceWith,
  bundleInstance,
  initInstance,
} from './instance';

export {
  loadScript,
  loadScriptNode,
  Module,
  getRemoteEntry,
  getRemoteInfo,
  satisfy,
  registerGlobalPlugins,
  type ModuleFederationRuntimePlugin,
  type RuntimePluginHooks,
  type Federation,
} from '@module-federation/runtime-core';

export { ModuleFederation };

const construct = (options: UserOptions): ModuleFederation =>
  new ModuleFederation(options);

export function createInstance(options: UserOptions): ModuleFederation {
  return createInstanceWith(options, construct);
}

export function init(options: UserOptions): ModuleFederation {
  return initInstance(options, ModuleFederation.runtimeCapabilities, construct);
}

export function loadRemote<T>(
  ...args: Parameters<ModuleFederation['loadRemote']>
): Promise<T | null> {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  const loadRemote: typeof bundleInstance.loadRemote<T> =
    bundleInstance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(bundleInstance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof bundleInstance.loadShare<T> =
    bundleInstance.loadShare;
  return loadShare.apply(bundleInstance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  const loadShareSync: typeof bundleInstance.loadShareSync<T> =
    bundleInstance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(bundleInstance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return bundleInstance.preloadRemote.apply(bundleInstance, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return bundleInstance.registerRemotes.apply(bundleInstance, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return bundleInstance.registerPlugins.apply(bundleInstance, args);
}

export function getInstance(): ModuleFederation | null;
export function getInstance(
  finder: (instance: ModuleFederation) => boolean,
): ModuleFederation | null;
export function getInstance(finder?: (instance: ModuleFederation) => boolean) {
  if (!finder) {
    return bundleInstance;
  }

  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find(finder) || null;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  assert(bundleInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return bundleInstance.registerShared.apply(bundleInstance, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
