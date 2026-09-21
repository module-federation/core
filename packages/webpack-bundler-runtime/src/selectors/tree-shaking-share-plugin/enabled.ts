import {
  getRemoteEntry,
  type ModuleFederation,
  type ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import type { ShareArgs, SharedGetter } from '@module-federation/runtime/types';
import type { Federation } from '../../types';
import type { TreeShakingSharePluginOptions } from './types';

type BundlerRuntime = NonNullable<Federation['bundlerRuntime']>;
type ShareModuleFactory = Extract<
  ReturnType<SharedGetter>,
  (...args: never[]) => unknown
>;

// SharedEntryModule emits init(mfInstance, bundlerRuntime) and get().
interface TreeShakenShareEntry {
  init(
    mfInstance: ModuleFederation,
    bundlerRuntime: BundlerRuntime,
  ): void | Promise<unknown>;
  get(): ShareModuleFactory;
}

function isTreeShakenShareEntry(entry: unknown): entry is TreeShakenShareEntry {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  const candidate = entry as { init?: unknown; get?: unknown };
  return (
    typeof candidate.init === 'function' && typeof candidate.get === 'function'
  );
}

export function createTreeShakingSharePlugin({
  webpackRequire,
}: TreeShakingSharePluginOptions): ModuleFederationRuntimePlugin {
  const { sharedFallback, bundlerRuntime, libraryType } =
    webpackRequire.federation;

  return {
    name: 'tree-shake-plugin',
    beforeInit(args) {
      const { userOptions, origin, options: registeredOptions } = args;
      const version = userOptions.version || registeredOptions.version;
      if (!sharedFallback || !bundlerRuntime) {
        return args;
      }

      const currentShared = userOptions.shared || {};
      const shared: Array<[pkgName: string, ShareArgs]> = [];

      Object.keys(currentShared).forEach((sharedName) => {
        const sharedArgs = Array.isArray(currentShared[sharedName])
          ? currentShared[sharedName]
          : [currentShared[sharedName]];
        sharedArgs.forEach((sharedArg) => {
          shared.push([sharedName, sharedArg]);
          if ('get' in sharedArg) {
            sharedArg.treeShaking ||= {};
            sharedArg.treeShaking.get = sharedArg.get;
            sharedArg.get = bundlerRuntime.getSharedFallbackGetter({
              shareKey: sharedName,
              factory: sharedArg.get,
              webpackRequire,
              libraryType,
              version: sharedArg.version,
            });
          }
        });
      });

      const hostGlobalSnapshot =
        helpers.global.getGlobalSnapshotInfoByModuleInfo({
          name: origin.name,
          version,
        });
      if (!hostGlobalSnapshot || !('shared' in hostGlobalSnapshot)) {
        return args;
      }

      Object.keys(registeredOptions.shared || {}).forEach((pkgName) => {
        const sharedInfo = registeredOptions.shared[pkgName];
        sharedInfo.forEach((sharedArg) => {
          shared.push([pkgName, sharedArg]);
        });
      });

      const patchShared = (pkgName: string, sharedArg: ShareArgs) => {
        const shareSnapshot = hostGlobalSnapshot.shared.find(
          (item) => item.sharedName === pkgName,
        );
        if (!shareSnapshot || !sharedArg.treeShaking) {
          return;
        }
        const {
          secondarySharedTreeShakingName,
          secondarySharedTreeShakingEntry,
          treeShakingStatus,
        } = shareSnapshot;
        if (sharedArg.treeShaking.status === treeShakingStatus) {
          return;
        }
        sharedArg.treeShaking.status = treeShakingStatus;
        if (
          secondarySharedTreeShakingEntry &&
          libraryType &&
          secondarySharedTreeShakingName
        ) {
          sharedArg.treeShaking.get = async () => {
            const shareEntry = await getRemoteEntry({
              origin,
              remoteInfo: {
                name: secondarySharedTreeShakingName,
                entry: secondarySharedTreeShakingEntry,
                type: libraryType,
                entryGlobalName: secondarySharedTreeShakingName,
                shareScope: 'default',
              },
            });
            if (!isTreeShakenShareEntry(shareEntry)) {
              throw new Error('Failed to load the tree-shaken share entry.');
            }
            await shareEntry.init(origin, bundlerRuntime);
            return shareEntry.get();
          };
        }
      };

      shared.forEach(([pkgName, sharedArg]) => {
        patchShared(pkgName, sharedArg);
      });

      return args;
    },
  };
}
