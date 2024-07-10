import type { FederationRuntimePlugin } from '@module-federation/runtime';
import type {
  PreloadOptions,
  PreloadConfig,
} from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';

const tool = helpers.tool;

function autoPreloadPlugin(
  preloadConfig?: PreloadConfig,
): FederationRuntimePlugin {
  return {
    name: 'auto-preload-plugin',
    async afterResolve(args) {
      const { remote, origin, expose, pkgNameOrAlias } = args;

      if (
        !tool.isRemoteInfoWithEntry(remote) ||
        !tool.isPureRemoteEntry(remote)
      ) {
        return args;
      }
      // preloading assets
      const preloadOptions: PreloadOptions[0] = {
        remote: remote,
        preloadConfig: {
          nameOrAlias: pkgNameOrAlias,
          exposes: [expose],
          resourceCategory: 'sync',
          share: false,
          depsRemote: false,
          ...preloadConfig,
        },
      };
      origin.remoteHandler.preloadAssets(preloadOptions);
      return args;
    },
  };
}

export default autoPreloadPlugin;
