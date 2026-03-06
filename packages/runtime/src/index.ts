import {
  ModuleFederation,
  type UserOptions,
  CurrentGlobal,
  getGlobalFederationConstructor,
  matchRemoteWithNameAndExpose,
  setGlobalFederationInstance,
  assert,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
import {
  runtimeDescMap,
  getShortErrorMsg,
  RUNTIME_009,
} from '@module-federation/error-codes';
import { getBuilderId, getGlobalFederationInstance } from './utils';

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
  const instance = new ModuleFederationConstructor(options);
  setGlobalFederationInstance(instance);
  FederationInstance = instance;
  return instance;
}

let FederationInstance: ModuleFederation | null = null;
function resolveFederationInstance(
  name?: string,
  version?: string,
  remoteId?: string,
): ModuleFederation | null {
  const buildId = getBuilderId();
  if (buildId) {
    const buildInstance = getGlobalFederationInstance(name || '', version);
    if (buildInstance) {
      FederationInstance = buildInstance;
      return buildInstance;
    }
  }

  if (name) {
    const namedInstance = getGlobalFederationInstance(name, version);
    if (namedInstance) {
      FederationInstance = namedInstance;
      return namedInstance;
    }
  }

  if (remoteId) {
    const instances = CurrentGlobal.__FEDERATION__?.__INSTANCES__ || [];
    const matchingInstance = instances.find((instance) =>
      matchRemoteWithNameAndExpose(instance.options.remotes, remoteId),
    );
    if (matchingInstance) {
      FederationInstance = matchingInstance;
      return matchingInstance;
    }
  }

  if (
    FederationInstance &&
    (!remoteId ||
      matchRemoteWithNameAndExpose(
        FederationInstance.options.remotes,
        remoteId,
      ))
  ) {
    return FederationInstance;
  }

  if (!name && !version) {
    const instances = CurrentGlobal.__FEDERATION__?.__INSTANCES__ || [];
    if (instances.length === 1) {
      FederationInstance = instances[0];
      return FederationInstance;
    }
  }

  return null;
}
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
  const instance = resolveFederationInstance(undefined, undefined, args[0]);
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  const loadRemote: typeof instance.loadRemote<T> = instance.loadRemote;
  // eslint-disable-next-line prefer-spread
  return loadRemote.apply(instance, args);
}

export function loadShare<T>(
  ...args: Parameters<ModuleFederation['loadShare']>
): Promise<false | (() => T | undefined)> {
  const instance = resolveFederationInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  const loadShare: typeof instance.loadShare<T> = instance.loadShare;
  return loadShare.apply(instance, args);
}

export function loadShareSync<T>(
  ...args: Parameters<ModuleFederation['loadShareSync']>
): () => T | never {
  const instance = resolveFederationInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  const loadShareSync: typeof instance.loadShareSync<T> =
    instance.loadShareSync;
  // eslint-disable-next-line prefer-spread
  return loadShareSync.apply(instance, args);
}

export function preloadRemote(
  ...args: Parameters<ModuleFederation['preloadRemote']>
): ReturnType<ModuleFederation['preloadRemote']> {
  const instance = resolveFederationInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return instance.preloadRemote.apply(instance, args);
}

export function registerRemotes(
  ...args: Parameters<ModuleFederation['registerRemotes']>
): ReturnType<ModuleFederation['registerRemotes']> {
  const instance = resolveFederationInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return instance.registerRemotes.apply(instance, args);
}

export function registerPlugins(
  ...args: Parameters<ModuleFederation['registerPlugins']>
): ReturnType<ModuleFederation['registerRemotes']> {
  const instance = resolveFederationInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return instance.registerPlugins.apply(instance, args);
}

export function getInstance(name?: string, version?: string) {
  return resolveFederationInstance(name, version);
}

export function registerShared(
  ...args: Parameters<ModuleFederation['registerShared']>
): ReturnType<ModuleFederation['registerShared']> {
  const instance = resolveFederationInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  // eslint-disable-next-line prefer-spread
  return instance.registerShared.apply(instance, args);
}

// Inject for debug
setGlobalFederationConstructor(ModuleFederation);
