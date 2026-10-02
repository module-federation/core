import { ModuleInfo, getResourceUrl } from '@module-federation/sdk/core';
import { ModuleFederationRuntimePlugin } from '../../type/plugin';
import { RUNTIME_011, runtimeDescMap } from '@module-federation/error-codes';
import {
  error,
  composeRemoteRequestId,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
  getRemoteEntryInfoFromSnapshot,
} from '../../utils';
import {
  PreloadOptions,
  PreloadRemoteArgs,
  RemoteInfo,
  SnapshotCapability,
} from '../../type';
import { generatePreloadAssetsPlugin } from '../generate-preload-assets';
import { preloadAssets } from '../../utils/preload';

export function assignRemoteInfo(
  remoteInfo: RemoteInfo,
  remoteSnapshot: ModuleInfo,
  inBrowser: boolean,
): void {
  const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(
    remoteSnapshot,
    inBrowser,
  );
  if (!remoteEntryInfo.url) {
    error(RUNTIME_011, runtimeDescMap, { remoteName: remoteInfo.name });
  }

  let entryUrl = getResourceUrl(remoteSnapshot, remoteEntryInfo.url, inBrowser);

  if (!inBrowser && !entryUrl.startsWith('http')) {
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
            id: composeRemoteRequestId(remote.name, expose),
          });

        assignRemoteInfo(
          remoteInfo,
          remoteSnapshot,
          origin.platform.isBrowser(),
        );
        // preloading assets
        const preloadOps: PreloadRemoteArgs[] = [
          {
            nameOrAlias: pkgNameOrAlias,
            exposes: [expose],
            resourceCategory: 'sync',
            share: false,
            depsRemote: false,
            recordPreloadedAssets: true,
          },
        ];
        await origin.remoteHandler.hooks.lifecycle.beforePreloadRemote.emit({
          preloadOps,
          options: origin.options,
          origin,
        });

        const [preloadConfig] = preloadOps;
        if (preloadConfig) {
          const preloadOptions: PreloadOptions[0] = {
            remote,
            preloadConfig,
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
            preloadAssets(
              remoteInfo,
              origin,
              assets,
              false,
              {
                initiator: 'loadRemote',
                id,
              },
              preloadConfig.recordPreloadedAssets,
            ).catch(() => undefined);
          }
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

export const snapshot: SnapshotCapability = {
  plugins: () => [snapshotPlugin(), generatePreloadAssetsPlugin()],
};
