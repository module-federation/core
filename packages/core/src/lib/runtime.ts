import {
  WebpackRemoteScriptFactory,
  WebpackSharingScopeFactory,
} from '../integrations/webpack/factory';
import type { ModuleFederationRuntimeOptions } from '../types';
import { getScope } from './scopes';

export const createModuleFederationRuntime = (
  options?: ModuleFederationRuntimeOptions
) => {
  const scriptFactory =
    options?.scriptFactory ?? new WebpackRemoteScriptFactory();
  const sharingScopeFactory =
    options?.sharingScopeFactory ?? new WebpackSharingScopeFactory();

  const scope = getScope();

  scope._runtime = {
    scriptFactory,
    sharingScopeFactory,
  };

  return scope._runtime;
};
