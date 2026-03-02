import {
  ModuleInfo,
  getResourceUrl,
  isBrowserEnv,
} from '@module-federation/sdk';
import { ModuleFederationRuntimePlugin } from '../../type/plugin';
import { RUNTIME_010, runtimeDescMap } from '@module-federation/error-codes';
import {
  error,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
  getRemoteEntryInfoFromSnapshot,
} from '../../utils';
import { PreloadOptions, RemoteInfo } from '../../type';
import { preloadAssets } from '../../utils/preload';

export function assignRemoteInfo(
  remoteInfo: RemoteInfo,
  remoteSnapshot: ModuleInfo,
): void {
  const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
  if (!remoteEntryInfo.url) {
    error(RUNTIME_010, runtimeDescMap, { remoteName: remoteInfo.name });
  }

  let entryUrl = getResourceUrl(remoteSnapshot, remoteEntryInfo.url);

  if (!isBrowserEnv() && !entryUrl.startsWith('http')) {
    entryUrl = `https:${entryUrl}`;
  }

  remoteInfo.type = remoteEntryInfo.type;
  remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
  remoteInfo.entry = entryUrl;
  remoteInfo.version = remoteSnapshot.version;
  remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}

export function snapshotPlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'snapshot-plugin',
    async afterResolve(args) {
      const { remote, pkgNameOrAlias, expose, origin, remoteInfo, id } = args;

      if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
        const { remoteSnapshot, globalSnapshot } =
          await origin.snapshotHandler.loadRemoteSnapshotInfo({
            moduleInfo: remote,
            id,
          });

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
