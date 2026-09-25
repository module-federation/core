import {
  CurrentGlobal,
  type FederationKernel,
} from '@module-federation/runtime-core/kernel';

// injected by bundler, so it can not use runtime-core stuff
export function getBuilderId(): string {
  //@ts-ignore
  return typeof FEDERATION_BUILD_IDENTIFIER !== 'undefined'
    ? //@ts-ignore
      FEDERATION_BUILD_IDENTIFIER
    : '';
}

export function isMatchingInstance(
  instance: FederationKernel,
  name: string,
  version: string | undefined,
): boolean {
  const buildId = getBuilderId();
  if (buildId && instance.options.id === buildId) {
    return true;
  }

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
): FederationKernel | undefined {
  return CurrentGlobal.__FEDERATION__.__INSTANCES__.find((instance) =>
    isMatchingInstance(instance, name, version),
  );
}
