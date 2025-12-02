import { getGlobalSnapshotInfoByModuleInfo } from '../global';
import type { ModuleFederationRuntimePlugin } from '../type';
import { getRemoteEntry } from '../utils';

declare const __MF_BUNDLER__: 'rspack';
const MF_BUNDLER =
  typeof __MF_BUNDLER__ === 'string' ? __MF_BUNDLER__ : 'rspack';

export const treeShakeSharePlugin: () => ModuleFederationRuntimePlugin =
  function () {
    return {
      name: 'tree-shake-plugin',
      beforeRegisterShare(args) {
        const { shared, origin, pkgName } = args;
        if (!shared.treeshake) {
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
        const { treeshake } = shared;

        const { reShakeShareName, reShakeShareEntry, reShakeShareType } =
          shareSnapshot;

        if (reShakeShareEntry && reShakeShareType && reShakeShareName) {
          treeshake.get = async () => {
            const shareEntry = await getRemoteEntry({
              origin,
              remoteInfo: {
                name: reShakeShareName,
                entry: reShakeShareEntry,
                type: reShakeShareType,
                entryGlobalName: reShakeShareName,
                // current not used
                shareScope: 'default',
              },
            });
            // TODO: add errorLoad hook ?
            // @ts-ignore TODO: move to webpack bundler runtime
            await shareEntry.init(
              origin,
              // @ts-ignore TODO: move to webpack bundler runtime
              MF_BUNDLER === 'rspack'
                ? __webpack_require__.federation.bundlerRuntime
                : () => {
                    throw new Error('NOT SUPPORT YET');
                  },
            );
            // @ts-ignore
            const getter = shareEntry.get();
            return getter;
          };
        }
        return args;
      },
    };
  };
