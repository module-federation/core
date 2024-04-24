import { FederationHost } from './core';
import {
  getGlobalFederationInstance,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  setGlobalFederationConstructor,
} from './global';
import { UserOptions, FederationRuntimePlugin } from './type';
import { assert } from './utils/logger';

export { FederationHost } from './core';
export { registerGlobalPlugins } from './global';
export { getRemoteEntry, getRemoteInfo } from './utils';
export { loadScript, loadScriptNode } from '@module-federation/sdk';

export type { Federation } from './global';
export type { FederationRuntimePlugin };

let FederationInstance: FederationHost | null = null;
export function init(options: UserOptions): FederationHost {
  // Retrieve the same instance with the same name
  const instance = getGlobalFederationInstance(options.name, options.version);
  if (!instance) {
    // Retrieve debug constructor
    const FederationConstructor =
      getGlobalFederationConstructor() || FederationHost;
    FederationInstance = new FederationConstructor(options);
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
  ...args: Parameters<FederationHost['loadRemote']>
): Promise<T | null> {
  assert(FederationInstance, 'Please call init first');
  const loadRemote: typeof FederationInstance.loadRemote<T> =
    FederationInstance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(FederationInstance, args);
}

export function loadShare<T>(
  ...args: Parameters<FederationHost['loadShare']>
): Promise<false | (() => T | undefined)> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof FederationInstance.loadShare<T> =
    FederationInstance.loadShare;
  return loadShare.apply(FederationInstance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<FederationHost['loadShareSync']>
): () => T | never {
  assert(FederationInstance, 'Please call init first');
  const loadShareSync: typeof FederationInstance.loadShareSync<T> =
    FederationInstance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(FederationInstance, args);
}

export function preloadRemote(
  ...args: Parameters<FederationHost['preloadRemote']>
): ReturnType<FederationHost['preloadRemote']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.preloadRemote.apply(FederationInstance, args);
}

export function registerRemotes(
  ...args: Parameters<FederationHost['registerRemotes']>
): ReturnType<FederationHost['registerRemotes']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerRemotes.apply(FederationInstance, args);
}

export function registerPlugins(
  ...args: Parameters<FederationHost['registerPlugins']>
): ReturnType<FederationHost['registerRemotes']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.registerPlugins.apply(FederationInstance, args);
}

// Inject for debug
setGlobalFederationConstructor(FederationHost);
