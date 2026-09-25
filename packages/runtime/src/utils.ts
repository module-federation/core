import {
  CurrentGlobal,
  type ModuleFederation,
} from '@module-federation/runtime-core/kernel';

export function isMatchingInstance(
  instance: ModuleFederation,
  name: string,
  version: string | undefined,
): boolean {
  if (instance.options.name === name && !instance.options.version && !version) {
    return true;
  }

  return Boolean(
    instance.options.name === name &&
    version &&
    instance.options.version === version,
  );
}

export function getGlobalFederationInstance(
  name: string,
  version: string | undefined,
): ModuleFederation | undefined {
  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find((instance) =>
    isMatchingInstance(instance, name, version),
  );
}
