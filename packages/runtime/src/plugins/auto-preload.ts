import { FederationRuntimePlugin } from '../type/plugin';
import { isPureRemoteEntry, isRemoteInfoWithEntry } from '../utils';
import { PreloadConfig, PreloadOptions } from '../type';
import { preloadAssets } from '../utils/preload';
import { getGlobalSnapshot } from '../global';

function autoPreloadPlugin(
  preloadConfig?: PreloadConfig,
): FederationRuntimePlugin {
  return {
    name: 'auto-preload-plugin',
    async afterResolve(args) {
      const { remote, origin, remoteInfo, expose, pkgNameOrAlias } = args;

      if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
        return args;
      }
      const { remoteSnapshot, globalSnapshot } =
        await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);

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
