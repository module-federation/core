import {
  ModuleInfo,
  getResourceUrl,
  isBrowserEnv,
} from '@module-federation/sdk';
import { FederationRuntimePlugin } from '../../type/plugin';
import {
  error,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
  getRemoteEntryInfoFromSnapshot,
  assignRemoteInfo,
} from '../../utils';
import { PreloadOptions, RemoteInfo } from '../../type';
import { preloadAssets } from '../../utils/preload';

export function snapshotPlugin(): FederationRuntimePlugin {
  return {
    name: 'snapshot-plugin',
    async afterResolve(args) {
      const { remote, pkgNameOrAlias, expose, origin, remoteInfo } = args;

      if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
        const { remoteSnapshot, globalSnapshot } =
          await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);

        assignRemoteInfo(remoteInfo, remoteSnapshot);
        // preloading assets
        const preloadOptions: PreloadOptions[0] = {
          remote,
          preloadConfig: {
            nameOrAlias: pkgNameOrAlias,
            exposes: [expose],
            resourceCategory: 'sync',
            share: false,
            depsRemote: false,
          },
        };

        const assets =
          await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit(
            {
              origin,
              preloadOptions,
              remoteInfo,
              remote,
              remoteSnapshot,
              globalSnapshot,
            },
          );

        if (assets) {
          preloadAssets(remoteInfo, origin, assets, false);
        }

        return {
          ...args,
          remoteSnapshot,
        };
      }

      return args;
    },
  };
}
