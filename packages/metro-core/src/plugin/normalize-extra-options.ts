import type { ModuleFederationExtraOptions } from '../types';

export function normalizeExtraOptions(
  extraOptions?: ModuleFederationExtraOptions,
) {
  return {
    ...extraOptions,
    flags: {
      unstable_patchHMRClient: false,
      unstable_patchInitializeCore: false,
      unstable_patchRuntimeRequire: false,
      ...extraOptions?.flags,
    },
  };
}
