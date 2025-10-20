import { getGlobalSnapshotInfoByModuleInfo } from '../global';
import type { ModuleFederationRuntimePlugin } from '../type';
import { error, getRemoteEntry } from '../utils';
import { TreeshakeStatus } from '@module-federation/sdk';

export const treeShakeSharePlugin: () => ModuleFederationRuntimePlugin =
  function () {
    return {
      name: 'tree-shake-plugin',
      beforeRegisterShare(args) {
        const { shared, origin, pkgName } = args;
        if (!shared.usedExports) {
          return args;
        }
        const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
          name: origin.name,
          version: origin.options.version,
        });
        if (!hostGlobalSnapshot || !('shared' in hostGlobalSnapshot)) {
          return args;
        }
        const shareSnapshot = hostGlobalSnapshot.shared.find(
          (item) => item.sharedName === pkgName,
        );
        if (!shareSnapshot) {
          return args;
        }
        const {
          treeshakeStatus,
          reShakeShareName,
          reShakeShareEntry,
          reShakeShareType,
        } = shareSnapshot;

        if (!treeshakeStatus) {
          if (!shared.fallback) {
            error(`fallback is required if enable treeshake!`);
          }
          shared.treeshakeStatus =
            typeof treeshakeStatus !== 'undefined'
              ? treeshakeStatus
              : TreeshakeStatus.UNKNOWN;
          return args;
        }
        shared.treeshakeStatus = treeshakeStatus;
        if (!reShakeShareName || !reShakeShareEntry || !reShakeShareType) {
          return args;
        }
        shared.reShakeGet = async () => {
          const shareEntry = await getRemoteEntry({
            origin,
            remoteInfo: {
              name: reShakeShareName,
              entry: reShakeShareEntry,
              type: reShakeShareType,
              entryGlobalName: reShakeShareName,
              shareScope: 'default',
            },
          });
          // TODO: add errorLoad hook ?
          // @ts-ignore TODO: move to webpack bundler runtime
          await shareEntry.init(
            origin,
            // @ts-ignore TODO: move to webpack bundler runtime
            __webpack_require__.federation.bundlerRuntime,
          );
          // @ts-ignore
          const getter = shareEntry.get();
          console.log('reShakeGet: ', getter);
          return getter;
        };

        return args;
      },
    };
  };
