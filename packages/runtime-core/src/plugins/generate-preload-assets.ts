import {
  GlobalModuleInfo,
  ModuleInfo,
  ProviderModuleInfo,
  isManifestProvider,
  getResourceUrl,
} from '@module-federation/sdk';
import {
  EntryAssets,
  FederationRuntimePlugin,
  PreloadAssets,
  PreloadConfig,
  PreloadOptions,
  RemoteInfoOptionalVersion,
  Shared,
  Remote,
} from '../type';
import { assignRemoteInfo } from './snapshot';
import { getInfoWithoutType, getPreloaded, setPreloaded } from '../global';
import { FederationHost } from '../core';
import { defaultPreloadArgs, normalizePreloadExposes } from '../utils/preload';
import { getRegisteredShare } from '../utils/share';
import {
  arrayOptions,
  getFMId,
  getRemoteEntryInfoFromSnapshot,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
} from '../utils';

declare global {
  // eslint-disable-next-line no-var
  var __INIT_VMOK_DEPLOY_GLOBAL_DATA__: boolean | undefined;
}

// name
// name:version
function splitId(id: string): {
  name: string;
  version: string | undefined;
} {
  const splitInfo = id.split(':');
  if (splitInfo.length === 1) {
    return {
      name: splitInfo[0],
      version: undefined,
    };
  } else if (splitInfo.length === 2) {
    return {
      name: splitInfo[0],
      version: splitInfo[1],
    };
  } else {
    return {
      name: splitInfo[1],
      version: splitInfo[2],
    };
  }
}

// Traverse all nodes in moduleInfo and traverse the entire snapshot
function traverseModuleInfo(
  globalSnapshot: GlobalModuleInfo,
  remoteInfo: RemoteInfoOptionalVersion,
  traverse: (
    snapshotInfo: ModuleInfo,
    remoteInfo: RemoteInfoOptionalVersion,
    isRoot: boolean,
  ) => void,
  isRoot: boolean,
  memo: Record<string, boolean> = {},
  remoteSnapshot?: ModuleInfo,
): void {
  const id = getFMId(remoteInfo);
  const { value: snapshotValue } = getInfoWithoutType(globalSnapshot, id);
  const effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
  if (effectiveRemoteSnapshot && !isManifestProvider(effectiveRemoteSnapshot)) {
    traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
    if (effectiveRemoteSnapshot.remotesInfo) {
      const remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
      for (const key of remoteKeys) {
        if (memo[key]) {
          continue;
        }
        memo[key] = true;
        const subRemoteInfo = splitId(key);
        const remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
        traverseModuleInfo(
          globalSnapshot,
          {
            name: subRemoteInfo.name,
            version: remoteValue.matchedVersion,
          },
          traverse,
          false,
          memo,
          undefined,
        );
      }
    }
  }
}

// eslint-disable-next-line max-lines-per-function
export function generatePreloadAssets(
  origin: FederationHost,
  preloadOptions: PreloadOptions[number],
  remote: RemoteInfoOptionalVersion,
  globalSnapshot: GlobalModuleInfo,
  remoteSnapshot: ModuleInfo,
): PreloadAssets {
  const cssAssets: Array<string> = [];
  const jsAssets: Array<string> = [];
  const entryAssets: Array<EntryAssets> = [];
  const loadedSharedJsAssets = new Set();
  const loadedSharedCssAssets = new Set();
  const { options } = origin;

  const { preloadConfig: rootPreloadConfig } = preloadOptions;
  const { depsRemote } = rootPreloadConfig;
  const memo = {};
  traverseModuleInfo(
    globalSnapshot,
    remote,
    (moduleInfoSnapshot: ModuleInfo, remoteInfo, isRoot) => {
      let preloadConfig: PreloadConfig;
      if (isRoot) {
        preloadConfig = rootPreloadConfig;
      } else {
        if (Array.isArray(depsRemote)) {
          // eslint-disable-next-line array-callback-return
          const findPreloadConfig = depsRemote.find((remoteConfig) => {
            if (
              remoteConfig.nameOrAlias === remoteInfo.name ||
              remoteConfig.nameOrAlias === remoteInfo.alias
            ) {
              return true;
            }
            return false;
          });
          if (!findPreloadConfig) {
            return;
          }
          preloadConfig = defaultPreloadArgs(findPreloadConfig);
        } else if (depsRemote === true) {
          preloadConfig = rootPreloadConfig;
        } else {
          return;
        }
      }

      const remoteEntryUrl = getResourceUrl(
        moduleInfoSnapshot,
        getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url,
      );

      if (remoteEntryUrl) {
        entryAssets.push({
          name: remoteInfo.name,
          moduleInfo: {
            name: remoteInfo.name,
            entry: remoteEntryUrl,
            type:
              'remoteEntryType' in moduleInfoSnapshot
                ? moduleInfoSnapshot.remoteEntryType
                : 'global',
            entryGlobalName:
              'globalName' in moduleInfoSnapshot
                ? moduleInfoSnapshot.globalName
                : remoteInfo.name,
            shareScope: '',
            version:
              'version' in moduleInfoSnapshot
                ? moduleInfoSnapshot.version
                : undefined,
          },
          url: remoteEntryUrl,
        });
      }

      let moduleAssetsInfo: NonNullable<ProviderModuleInfo['modules']> =
        'modules' in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
      const normalizedPreloadExposes = normalizePreloadExposes(
        preloadConfig.exposes,
      );
      if (normalizedPreloadExposes.length && 'modules' in moduleInfoSnapshot) {
        moduleAssetsInfo = moduleInfoSnapshot?.modules?.reduce(
          (assets, moduleAssetInfo) => {
            if (
              normalizedPreloadExposes?.indexOf(moduleAssetInfo.moduleName) !==
              -1
            ) {
              assets.push(moduleAssetInfo);
            }
            return assets;
          },
          [] as NonNullable<(typeof moduleInfoSnapshot)['modules']>,
        );
      }

      function handleAssets(assets: string[]): string[] {
        const assetsRes = assets.map((asset) =>
          getResourceUrl(moduleInfoSnapshot, asset),
        );
        if (preloadConfig.filter) {
          return assetsRes.filter(preloadConfig.filter);
        }
        return assetsRes;
      }

      if (moduleAssetsInfo) {
        const assetsLength = moduleAssetsInfo.length;
        for (let index = 0; index < assetsLength; index++) {
          const assetsInfo = moduleAssetsInfo[index];
          const exposeFullPath = `${remoteInfo.name}/${assetsInfo.moduleName}`;
          origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
            id:
              assetsInfo.moduleName === '.' ? remoteInfo.name : exposeFullPath,
            name: remoteInfo.name,
            remoteSnapshot: moduleInfoSnapshot,
            preloadConfig,
            remote: remoteInfo as Remote,
            origin,
          });
          const preloaded = getPreloaded(exposeFullPath);
          if (preloaded) {
            continue;
          }

          if (preloadConfig.resourceCategory === 'all') {
            cssAssets.push(...handleAssets(assetsInfo.assets.css.async));
            cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
            jsAssets.push(...handleAssets(assetsInfo.assets.js.async));
            jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
            // eslint-disable-next-line no-constant-condition
          } else if ((preloadConfig.resourceCategory = 'sync')) {
            cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
            jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
          }

          setPreloaded(exposeFullPath);
        }
      }
    },
    true,
    memo,
    remoteSnapshot,
  );

  if (remoteSnapshot.shared) {
    const collectSharedAssets = (
      shareInfo: Shared,
      snapshotShared: ModuleInfo['shared'][0],
    ) => {
      const registeredShared = getRegisteredShare(
        origin.shareScopeMap,
        snapshotShared.sharedName,
        shareInfo,
        origin.sharedHandler.hooks.lifecycle.resolveShare,
      );
      // If the global share does not exist, or the lib function does not exist, it means that the shared has not been loaded yet and can be preloaded.

      if (registeredShared && typeof registeredShared.lib === 'function') {
        snapshotShared.assets.js.sync.forEach((asset) => {
          loadedSharedJsAssets.add(asset);
        });
        snapshotShared.assets.css.sync.forEach((asset) => {
          loadedSharedCssAssets.add(asset);
        });
      }
    };
    remoteSnapshot.shared.forEach((shared) => {
      const shareInfos = options.shared?.[shared.sharedName];
      if (!shareInfos) {
        return;
      }
      // if no version, preload all shared
      const sharedOptions = shared.version
        ? shareInfos.find((s) => s.version === shared.version)
        : shareInfos;

      if (!sharedOptions) {
        return;
      }
      const arrayShareInfo = arrayOptions(sharedOptions);
      arrayShareInfo.forEach((s) => {
        collectSharedAssets(s, shared);
      });
    });
  }

  const needPreloadJsAssets = jsAssets.filter(
    (asset) => !loadedSharedJsAssets.has(asset),
  );
  const needPreloadCssAssets = cssAssets.filter(
    (asset) => !loadedSharedCssAssets.has(asset),
  );

  return {
    cssAssets: needPreloadCssAssets,
    jsAssetsWithoutEntry: needPreloadJsAssets,
    entryAssets,
  };
}

export const generatePreloadAssetsPlugin: () => FederationRuntimePlugin =
  function () {
    return {
      name: 'generate-preload-assets-plugin',
      async generatePreloadAssets(args) {
        const {
          origin,
          preloadOptions,
          remoteInfo,
          remote,
          globalSnapshot,
          remoteSnapshot,
        } = args;

        if (isRemoteInfoWithEntry(remote) && isPureRemoteEntry(remote)) {
          return {
            cssAssets: [],
            jsAssetsWithoutEntry: [],
            entryAssets: [
              {
                name: remote.name,
                url: remote.entry,
                moduleInfo: {
                  name: remoteInfo.name,
                  entry: remote.entry,
                  type: remoteInfo.type || 'global',
                  entryGlobalName: '',
                  shareScope: '',
                },
              },
            ],
          };
        }

        assignRemoteInfo(remoteInfo, remoteSnapshot);

        const assets = generatePreloadAssets(
          origin,
          preloadOptions,
          remoteInfo,
          globalSnapshot,
          remoteSnapshot,
        );

        return assets;
      },
    };
  };
