import {
  ModuleFederation,
  type UserOptions,
  CurrentGlobal,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  assert,
  assertRuntimeImageCompatible,
  attachRuntimeImage,
  readRuntimeImage,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
import { runtimeDescMap, RUNTIME_009 } from '@module-federation/error-codes';
import { getGlobalFederationInstance } from './utils';

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

export function createInstance(options: UserOptions) {
  // Retrieve debug constructor
  const globalConstructor = getGlobalFederationConstructor();
  const ModuleFederationConstructor = globalConstructor || ModuleFederation;
  if (options.runtimeImage) {
    if (globalConstructor && globalConstructor !== ModuleFederation) {
      assertRuntimeImageCompatible(
        readRuntimeImage(globalConstructor),
        options.runtimeImage,
      );
    }
    attachRuntimeImage(ModuleFederationConstructor, options.runtimeImage);
  }
  const instance = new ModuleFederationConstructor({
    id: `${options.name}@${options.version || Date.now()}`,
    ...options,
  });
  if (options.runtimeImage) {
    attachRuntimeImage(instance, options.runtimeImage);
  }
  setGlobalFederationInstance(instance);
  return instance;
}

let FederationInstance: ModuleFederation | null = null;
function getDefaultFederationInstance(): ModuleFederation | null {
  return (
    FederationInstance ??
    CurrentGlobal.__FEDERATION__.__DEFAULT_INSTANCE__ ??
    null
  );
}

export function init(options: UserOptions): ModuleFederation {
  // Retrieve the same instance with the same name
  const instance = getGlobalFederationInstance(options.name, options.version);
  const normalizedOptions = { ...options, id: options.id || '' };
  if (!instance) {
    FederationInstance = createInstance(normalizedOptions);
    return FederationInstance;
  } else {
    assertRuntimeImageCompatible(
      readRuntimeImage(instance),
      normalizedOptions.runtimeImage,
    );
    // Merge options
    instance.initOptions(normalizedOptions);
    if (!FederationInstance) {
      FederationInstance = instance;
    }
    return instance;
  }
}

export function loadRemote<T>(
  ...args: Parameters<ModuleFederation['loadRemote']>
): Promise<T | null> {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  const loadRemote: typeof instance.loadRemote<T> = instance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(instance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof instance.loadShare<T> = instance.loadShare;
  return loadShare.apply(instance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  const loadShareSync: typeof instance.loadShareSync<T> =
    instance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(instance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return instance.preloadRemote.apply(instance, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return instance.registerRemotes.apply(instance, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return instance.registerPlugins.apply(instance, args);
}

export function getInstance(): ModuleFederation | null;
export function getInstance(
  finder: (instance: ModuleFederation) => boolean,
): ModuleFederation | null;
export function getInstance(finder?: (instance: ModuleFederation) => boolean) {
  if (!finder) {
    return getDefaultFederationInstance();
  }

  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find(finder) || null;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  const instance = getDefaultFederationInstance();
  assert(instance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return instance.registerShared.apply(instance, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
