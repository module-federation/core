import { FederationRuntimePlugin } from '../../type/plugin';
import {
  error,
  getResourceUrl,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
} from '../../utils';
import { ModuleInfo } from '@module-federation/sdk';
import { PreloadOptions, RemoteInfo } from '../../type';
import { preloadAssets } from '../../utils/preload';

export function assignRemoteInfo(
  remoteInfo: RemoteInfo,
  remoteSnapshot: ModuleInfo,
): void {
  if (!('remoteEntry' in remoteSnapshot) || !remoteSnapshot.remoteEntry) {
    error(`The remoteEntry attribute of ${name} cannot be undefined.`);
  }
  const { remoteEntry } = remoteSnapshot;

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
    async loadRemoteMatch(args) {
      const { remote, pkgNameOrAlias, expose, origin, remoteInfo } = args;

      if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
        const { remoteSnapshot, globalSnapshot } =
          await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);

        assignRemoteInfo(remoteInfo, remoteSnapshot);
        // preload assets
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
      }

      return args;
    },
  };
}
