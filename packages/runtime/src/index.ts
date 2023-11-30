import { FederationHost } from './core';
import {
  getGlobalFederationInstance,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  setGlobalFederationConstructor,
} from './global';
import { UserOptions } from './type';
import { assert } from './utils/logger';

export { FederationHost } from './core';
export { registerGlobalPlugins } from './global';
export type { Federation } from './global';

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
    return instance;
  }
}

export function loadRemote(
  ...args: Parameters<FederationHost['loadRemote']>
): ReturnType<FederationHost['loadRemote']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.loadRemote.apply(FederationInstance, args);
}

export function loadShare(
  ...args: Parameters<FederationHost['loadShare']>
): ReturnType<FederationHost['loadShare']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.loadShare.apply(FederationInstance, args);
}

export function loadShareSync(
  ...args: Parameters<FederationHost['loadShareSync']>
): ReturnType<FederationHost['loadShareSync']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.loadShareSync.apply(FederationInstance, args);
}

export function preloadRemote(
  ...args: Parameters<FederationHost['preloadRemote']>
): ReturnType<FederationHost['preloadRemote']> {
  assert(FederationInstance, 'Please call init first');
  // eslint-disable-next-line prefer-spread
  return FederationInstance.preloadRemote.apply(FederationInstance, args);
}

// Inject for debug
setGlobalFederationConstructor(FederationHost);
