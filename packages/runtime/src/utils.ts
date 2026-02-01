import type { ModuleFederation } from '@module-federation/runtime-core';
import { CurrentGlobal } from '@module-federation/runtime-core';

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
): ModuleFederation | undefined {
  const buildId = getBuilderId();
  const federation = (
    CurrentGlobal as typeof globalThis & {
      __FEDERATION__?: { __INSTANCES__?: ModuleFederation[] };
    }
  ).__FEDERATION__;
  const instances = federation?.__INSTANCES__ ?? [];
  return instances.find((GMInstance: ModuleFederation) => {
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
  });
}
