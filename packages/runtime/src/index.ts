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
  initInstance,
  getCurrentInstance,
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

export function createInstance(options: UserOptions): ModuleFederation {
  return createInstanceWith(options, undefined, ModuleFederation);
}

export function init(options: UserOptions): ModuleFederation {
  return initInstance(options, undefined, ModuleFederation);
}

export function loadRemote<T>(
  ...args: Parameters<ModuleFederation['loadRemote']>
): Promise<T | null> {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  const loadRemote: typeof FederationInstance.loadRemote<T> =
    FederationInstance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(FederationInstance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof FederationInstance.loadShare<T> =
    FederationInstance.loadShare;
  return loadShare.apply(FederationInstance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  const loadShareSync: typeof FederationInstance.loadShareSync<T> =
    FederationInstance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(FederationInstance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return FederationInstance.preloadRemote.apply(FederationInstance, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerRemotes.apply(FederationInstance, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerPlugins.apply(FederationInstance, args);
}

export function getInstance(): ModuleFederation | null;
export function getInstance(
  finder: (instance: ModuleFederation) => boolean,
): ModuleFederation | null;
export function getInstance(finder?: (instance: ModuleFederation) => boolean) {
  if (!finder) {
    return getCurrentInstance();
  }

  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find(finder) || null;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  const FederationInstance = getCurrentInstance();
  assert(FederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerShared.apply(FederationInstance, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
