import type {
  ModuleFederationRuntime,
  ModuleFederationRuntimeOptions,
} from '../types';
import { initializeSharingScope, loadScript } from '../integrations/webpack';

export function createModuleFederationRuntime(
  options?: ModuleFederationRuntimeOptions,
): ModuleFederationRuntime {
  const scriptFactory = options?.scriptFactory ?? { loadScript };
  const sharingScopeFactory = options?.sharingScopeFactory ?? {
    initializeSharingScope,
  };

  //test change

  return {
    scriptFactory,
    sharingScopeFactory,
    remotes: {},
    sharingScope: {
      default: {},
    },
  };
}
