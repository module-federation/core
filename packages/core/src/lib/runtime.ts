import {
  WebpackRemoteScriptFactory,
  WebpackSharingScopeFactory,
} from '../integrations/webpack';

import type {
  ModuleFederationRuntime,
  ModuleFederationRuntimeOptions,
} from '../types';

export function createModuleFederationRuntime(options?: ModuleFederationRuntimeOptions): ModuleFederationRuntime {
  const scriptFactory = options?.scriptFactory ?? new WebpackRemoteScriptFactory();
  const sharingScopeFactory = options?.sharingScopeFactory ?? new WebpackSharingScopeFactory();

  return {
    scriptFactory,
    sharingScopeFactory,
    remotes: {},
    sharingScope: {
      default: {},
    },
  };
}
