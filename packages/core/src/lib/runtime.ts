import {
  WebpackRemoteScriptFactory,
  WebpackSharingScopeFactory,
} from '../integrations/webpack/factory';
import type {
  ModuleFederationRuntime,
  ModuleFederationRuntimeOptions,
} from '../types';

export const createModuleFederationRuntime = (
  options?: ModuleFederationRuntimeOptions
): ModuleFederationRuntime => {
  const scriptFactory =
    options?.scriptFactory ?? new WebpackRemoteScriptFactory();

  const sharingScopeFactory =
    options?.sharingScopeFactory ?? new WebpackSharingScopeFactory();

  return {
    scriptFactory,
    sharingScopeFactory,
    remotes: {},
    sharingScope: {
      default: {},
    },
  };
};
