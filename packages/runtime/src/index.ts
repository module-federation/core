import {
  ModuleFederation,
  type UserOptions,
  CurrentGlobal,
  getGlobalFederationConstructor,
  assert,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
import { runtimeDescMap, RUNTIME_009 } from '@module-federation/error-codes';
import {
  createInstance as createInstanceWith,
  current,
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

// The debug constructor lets a debugging tool substitute its own class.
const construct = (options: UserOptions): ModuleFederation =>
  new (getGlobalFederationConstructor() || ModuleFederation)(options);

export function createInstance(options: UserOptions): ModuleFederation {
  return createInstanceWith(options, construct);
}

export function init(options: UserOptions): ModuleFederation {
  return initInstance(options, construct);
}

export function loadRemote<T>(
  ...args: Parameters<ModuleFederation['loadRemote']>
): Promise<T | null> {
  assert(current, RUNTIME_009, runtimeDescMap);
  const loadRemote: typeof current.loadRemote<T> = current.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(current, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  assert(current, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof current.loadShare<T> = current.loadShare;
  return loadShare.apply(current, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  assert(current, RUNTIME_009, runtimeDescMap);
  const loadShareSync: typeof current.loadShareSync<T> = current.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(current, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  assert(current, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return current.preloadRemote.apply(current, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(current, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return current.registerRemotes.apply(current, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(current, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return current.registerPlugins.apply(current, args);
}

export function getInstance(): ModuleFederation | null;
export function getInstance(
  finder: (instance: ModuleFederation) => boolean,
): ModuleFederation | null;
export function getInstance(finder?: (instance: ModuleFederation) => boolean) {
  if (!finder) {
    return current;
  }

  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find(finder) || null;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  assert(current, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return current.registerShared.apply(current, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
