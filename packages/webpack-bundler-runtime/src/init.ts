import type { WebpackRequire } from './types';
import {
  getRemoteEntry,
  type ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import type { ShareArgs } from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';
import { unloadRemotePlugin } from './unload-remote-plugin';

const WEBPACK_REQUIRE_SYMBOL = Symbol.for('mf_webpack_require');

export function init({ webpackRequire }: { webpackRequire: WebpackRequire }) {
  const { initOptions, runtime, sharedFallback, bundlerRuntime, libraryType } =
    webpackRequire.federation;

  if (!initOptions) {
    throw new Error('initOptions is required!');
  }

  const treeShakingSharePlugin: () => ModuleFederationRuntimePlugin =
    function () {
      return {
        name: 'tree-shake-plugin',
        beforeInit(args) {
          const { userOptions, origin, options: registeredOptions } = args;
          const version = userOptions.version || registeredOptions.version;
          if (!sharedFallback) {
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
                sharedArg.get = bundlerRuntime!.getSharedFallbackGetter({
                  shareKey: sharedName,
                  factory: sharedArg.get,
                  webpackRequire,
                  libraryType,
                  version: sharedArg.version,
                });
              }
            });
          });

          // read snapshot to override re-shake getter
          const hostGlobalSnapshot =
            helpers.global.getGlobalSnapshotInfoByModuleInfo({
              name: origin.name,
              version: version,
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

          const patchShared = (pkgName: string, shared: ShareArgs) => {
            const shareSnapshot = hostGlobalSnapshot.shared.find(
              (item) => item.sharedName === pkgName,
            );
            if (!shareSnapshot) {
              return;
            }
            const { treeShaking } = shared;
            if (!treeShaking) {
              return;
            }
            const {
              secondarySharedTreeShakingName,
              secondarySharedTreeShakingEntry,
              treeShakingStatus,
            } = shareSnapshot;
            if (treeShaking.status === treeShakingStatus) {
              return;
            }
            treeShaking.status = treeShakingStatus;
            if (
              secondarySharedTreeShakingEntry &&
              libraryType &&
              secondarySharedTreeShakingName
            ) {
              treeShaking.get = async () => {
                const shareEntry = await getRemoteEntry({
                  origin,
                  remoteInfo: {
                    name: secondarySharedTreeShakingName,
                    entry: secondarySharedTreeShakingEntry,
                    type: libraryType,
                    entryGlobalName: secondarySharedTreeShakingName,
                    // current not used
                    shareScope: 'default',
                  },
                });
                // TODO: add errorLoad hook ?
                // @ts-ignore
                await shareEntry.init(
                  origin,
                  // @ts-ignore
                  __webpack_require__.federation.bundlerRuntime,
                );
                // @ts-ignore
                const getter = shareEntry.get();
                return getter;
              };
            }
          };
          shared.forEach(([pkgName, sharedArg]) => {
            patchShared(pkgName, sharedArg);
          });

          return args;
        },
      };
    };

  initOptions.plugins ||= [];
  initOptions.plugins.push(treeShakingSharePlugin(), unloadRemotePlugin());
  const instance = runtime!.init(initOptions);
  (instance as unknown as Record<symbol, unknown>)[WEBPACK_REQUIRE_SYMBOL] =
    webpackRequire;
  return instance;
}
