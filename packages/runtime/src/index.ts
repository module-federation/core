import {
  ModuleFederation,
  type UserOptions,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  assert,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
import {
  runtimeDescMap,
  getShortErrorMsg,
  RUNTIME_009,
} from '@module-federation/error-codes';
import { getGlobalFederationInstance } from './utils';

export {
  loadScript,
  loadScriptNode,
  Module,
  getRemoteEntry,
  getRemoteInfo,
  registerGlobalPlugins,
  type ModuleFederationRuntimePlugin,
  type Federation,
} from '@module-federation/runtime-core';

export { createLogger } from '@module-federation/sdk';

export { ModuleFederation };

export function createInstance(options: UserOptions) {
  // Retrieve debug constructor
  const ModuleFederationConstructor =
    getGlobalFederationConstructor() || ModuleFederation;
  const instance = new ModuleFederationConstructor(options);
  setGlobalFederationInstance(instance);
  return instance;
}

let FederationInstance: ModuleFederation | null = null;
/**
 * @deprecated Use createInstance or getInstance instead
 */
export function init(options: UserOptions): ModuleFederation {
  // Retrieve the same instance with the same name
  const instance = getGlobalFederationInstance(options.name, options.version);
  if (!instance) {
    FederationInstance = createInstance(options);
    return FederationInstance;
  } else {
    // Merge options
    instance.initOptions(options);
    if (!FederationInstance) {
      FederationInstance = instance;
    }
    return instance;
  }
}

export function loadRemote<T>(
  ...args: Parameters<ModuleFederation['loadRemote']>
): Promise<T | null> {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  const loadRemote: typeof FederationInstance.loadRemote<T> =
    FederationInstance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(FederationInstance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof FederationInstance.loadShare<T> =
    FederationInstance.loadShare;
  return loadShare.apply(FederationInstance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  const loadShareSync: typeof FederationInstance.loadShareSync<T> =
    FederationInstance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(FederationInstance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return FederationInstance.preloadRemote.apply(FederationInstance, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerRemotes.apply(FederationInstance, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerPlugins.apply(FederationInstance, args);
}

export function getInstance() {
  return FederationInstance;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  assert(FederationInstance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerShared.apply(FederationInstance, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
