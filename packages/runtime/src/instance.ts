import {
  CurrentGlobal,
  setGlobalFederationInstance,
  type ModuleFederation,
  type UserOptions,
} from '@module-federation/runtime-core/kernel';

// injected by bundler, so it can not use runtime-core stuff
export function getBuilderId(): string {
  //@ts-ignore
  return typeof FEDERATION_BUILD_IDENTIFIER !== 'undefined'
    ? //@ts-ignore
      FEDERATION_BUILD_IDENTIFIER
    : '';
}

export function getGlobalFederationInstance(
  name: string,
  version: string | undefined,
  runtimeCapabilities: string,
  preferred?: ModuleFederation | null,
): ModuleFederation | undefined {
  const buildId = getBuilderId();
  return [preferred, ...CurrentGlobal.__FEDERATION__.__INSTANCES__].find(
    (GMInstance): GMInstance is ModuleFederation => {
      if (!GMInstance) {
        return false;
      }
      if (
        GMInstance !== preferred &&
        GMInstance.runtimeCapabilities !== runtimeCapabilities
      ) {
        return false;
      }
      if (buildId && GMInstance.options.id === buildId) {
        return true;
      }

      if (
        GMInstance.options.name === name &&
        !GMInstance.options.version &&
        !version
      ) {
        return true;
      }

      if (
        GMInstance.options.name === name &&
        version &&
        GMInstance.options.version === version
      ) {
        return true;
      }
      return false;
    },
  );
}

export let bundleInstance: ModuleFederation | null = null;

export function createInstance<T extends ModuleFederation>(
  options: UserOptions,
  construct: (options: UserOptions) => T,
): T {
  const instance = construct({
    id: `${options.name}@${options.version || Date.now()}`,
    ...options,
  });
  setGlobalFederationInstance(instance);
  return instance;
}

export function initInstance<T extends ModuleFederation>(
  options: UserOptions,
  runtimeCapabilities: string,
  construct: (options: UserOptions) => T,
): T {
  const instance = getGlobalFederationInstance(
    options.name,
    options.version,
    runtimeCapabilities,
    bundleInstance,
  );
  const normalizedOptions = { ...options, id: options.id || '' };
  if (!instance) {
    return (bundleInstance = createInstance(normalizedOptions, construct));
  }
  instance.initOptions(normalizedOptions);
  if (!bundleInstance) {
    bundleInstance = instance;
  }
  return instance as T;
}
