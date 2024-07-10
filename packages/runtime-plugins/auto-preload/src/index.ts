import type { FederationRuntimePlugin } from '@module-federation/runtime';
import type { PreloadConfig } from '@module-federation/runtime/types';
import { autoPreload } from './plugin';

function autoPreloadPlugin(
  preloadConfig?: PreloadConfig,
): FederationRuntimePlugin {
  return {
    name: 'auto-preload-plugin',
    async afterResolve(args) {
      autoPreload(args, preloadConfig);
      return args;
    },
  };
}

export default autoPreloadPlugin;
