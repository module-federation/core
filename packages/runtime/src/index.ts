import {
  ModuleFederation,
  type UserOptions,
  CurrentGlobal,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  assert,
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

/**
 * Creates a new ModuleFederation instance and registers it in the global
 * instance list. Unlike `init()`, this never establishes or changes the
 * module-level default instance used by the top-level convenience APIs.
 */
export function createInstance(options: UserOptions) {
  // Retrieve debug constructor
  const ModuleFederationConstructor =
    getGlobalFederationConstructor() || ModuleFederation;
  const instance = new ModuleFederationConstructor({
    id: `${options.name}@${options.version || Date.now()}`,
    ...options,
  });
  setGlobalFederationInstance(instance);
  return instance;
}

let DefaultFederationInstance: ModuleFederation | null = null;

/**
 * Initializes (or re-initializes) the ModuleFederation instance for
 * `options.name` / `options.version`.
 *
 * Default-instance contract:
 * - The first successful `init()` establishes the module-level default that
 *   backs the top-level convenience APIs (`loadRemote`, `loadShare`,
 *   `loadShareSync`, `preloadRemote`, `registerRemotes`, `registerPlugins`,
 *   `registerShared` and `getInstance()` called without a finder).
 * - Later `init()` calls create or reuse named instances and return them, but
 *   never redirect the top-level APIs away from the established default.
 * - `createInstance()` never establishes or changes the default.
 * - An instance created by `createInstance()` and later passed through `init()`
 *   with the same name becomes the default only if no default exists yet.
 */
export function init(options: UserOptions): ModuleFederation {
  const normalizedOptions = { ...options, id: options.id || '' };
  // Retrieve the same instance with the same name
  let instance = getGlobalFederationInstance(options.name, options.version);
  if (instance) {
    // Merge options
    instance.initOptions(normalizedOptions);
  } else {
    instance = createInstance(normalizedOptions);
  }
  DefaultFederationInstance ??= instance;
  return instance;
}

export function loadRemote<T>(
  ...args: Parameters<ModuleFederation['loadRemote']>
): Promise<T | null> {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  const loadRemote: typeof DefaultFederationInstance.loadRemote<T> =
    DefaultFederationInstance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(DefaultFederationInstance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof DefaultFederationInstance.loadShare<T> =
    DefaultFederationInstance.loadShare;
  return loadShare.apply(DefaultFederationInstance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  const loadShareSync: typeof DefaultFederationInstance.loadShareSync<T> =
    DefaultFederationInstance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(DefaultFederationInstance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return DefaultFederationInstance.preloadRemote.apply(
    DefaultFederationInstance,
    args,
  );
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return DefaultFederationInstance.registerRemotes.apply(
    DefaultFederationInstance,
    args,
  );
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return DefaultFederationInstance.registerPlugins.apply(
    DefaultFederationInstance,
    args,
  );
}

export function getInstance(): ModuleFederation | null;
export function getInstance(
  finder: (instance: ModuleFederation) => boolean,
): ModuleFederation | null;
export function getInstance(finder?: (instance: ModuleFederation) => boolean) {
  if (!finder) {
    return DefaultFederationInstance;
  }

  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find(finder) || null;
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  assert(DefaultFederationInstance, RUNTIME_009, runtimeDescMap);
  // eslint-disable-next-line prefer-spread
  return DefaultFederationInstance.registerShared.apply(
    DefaultFederationInstance,
    args,
  );
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
