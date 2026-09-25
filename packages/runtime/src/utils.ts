import {
  CurrentGlobal,
  type ModuleFederation,
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
  preferred?: ModuleFederation | null,
): ModuleFederation | undefined {
  const buildId = getBuilderId();
  return [preferred, ...CurrentGlobal.__FEDERATION__.__INSTANCES__].find(
    (GMInstance): GMInstance is ModuleFederation => {
      if (!GMInstance) {
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
