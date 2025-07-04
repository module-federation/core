import {
  ModuleFederation,
  type UserOptions,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  assert,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
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

export { ModuleFederation };

export function createInstance(options: UserOptions) {
  // Retrieve debug constructor
  const ModuleFederationConstructor =
    getGlobalFederationConstructor() || ModuleFederation;
  return new ModuleFederationConstructor(options);
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
    setGlobalFederationInstance(FederationInstance);
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
  assert(FederationInstance, 'Please call init first');
  const loadRemote: typeof FederationInstance.loadRemote<T> =
    FederationInstance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(FederationInstance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof FederationInstance.loadShare<T> =
    FederationInstance.loadShare;
  return loadShare.apply(FederationInstance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  assert(FederationInstance, 'Please call init first');
  const loadShareSync: typeof FederationInstance.loadShareSync<T> =
    FederationInstance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(FederationInstance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.preloadRemote.apply(FederationInstance, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerRemotes.apply(FederationInstance, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerPlugins.apply(FederationInstance, args);
}

export function getInstance() {
  return FederationInstance;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerShared.apply(FederationInstance, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
