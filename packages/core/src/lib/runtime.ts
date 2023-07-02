import {
  WebpackRemoteScriptFactory,
  WebpackSharingScopeFactory,
} from '../integrations/webpack/factory';
import type { ModuleFederationRuntimeOptions } from '../types';

export const createModuleFederationRuntime = (
  options?: ModuleFederationRuntimeOptions
) => {
  const scriptFactory =
    options?.scriptFactory ?? new WebpackRemoteScriptFactory();
  const sharingScopeFactory =
    options?.sharingScopeFactory ?? new WebpackSharingScopeFactory();

  return {
    scriptFactory,
    sharingScopeFactory,
  };
};
