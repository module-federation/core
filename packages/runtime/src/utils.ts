import {
  CurrentGlobal,
  type ModuleFederation,
} from '@module-federation/runtime-core/kernel';

export function getGlobalFederationInstance(
  name: string,
  version: string | undefined,
  preferred?: ModuleFederation | null,
): ModuleFederation | undefined {
  return [preferred, ...CurrentGlobal.__FEDERATION__.__INSTANCES__].find(
    (GMInstance): GMInstance is ModuleFederation => {
      if (!GMInstance) {
        return false;
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
