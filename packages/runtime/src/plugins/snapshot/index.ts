import { ModuleInfo, getResourceUrl } from '@module-federation/sdk';

import { FederationRuntimePlugin } from '../../type/plugin';
import {
  error,
  getRemoteEntryFromSnapshot,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
} from '../../utils';
import { PreloadOptions, RemoteInfo } from '../../type';
import { preloadAssets } from '../../utils/preload';

export function assignRemoteInfo(
  remoteInfo: RemoteInfo,
  remoteSnapshot: ModuleInfo,
): void {
  const remoteEntry = getRemoteEntryFromSnapshot(remoteSnapshot);
  if (!remoteEntry) {
    error(
      `The attribute remoteEntry of ${remoteInfo.name} must not be undefined.`,
    );
  }

  const entryUrl = getResourceUrl(remoteSnapshot, remoteEntry);

  remoteInfo.type = remoteSnapshot.remoteEntryType;
  remoteInfo.entryGlobalName = remoteSnapshot.globalName;
  remoteInfo.entry = entryUrl;
  remoteInfo.version = remoteSnapshot.version;
  remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}

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

        const assets = await origin.hooks.lifecycle.generatePreloadAssets.emit({
          origin,
          preloadOptions,
          remoteInfo,
          remote,
          remoteSnapshot,
          globalSnapshot,
        });

        if (assets) {
          preloadAssets(remoteInfo, origin, assets);
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
