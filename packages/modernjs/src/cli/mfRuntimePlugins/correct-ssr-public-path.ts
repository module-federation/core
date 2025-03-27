import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { getGlobalSnapshotInfoByModuleInfo } from '@module-federation/enhanced/runtime-core';

declare const __webpack_require__: Record<string, unknown>;
const correctSsrPublicPathPlugin: () => FederationRuntimePlugin = () => ({
  name: 'correct-ssr-public-path-plugin',
  beforeInit(args) {
    const { options } = args;
    if (typeof window !== 'undefined' || !options.version) {
      return args;
    }
    if (typeof __webpack_require__ !== 'undefined' && __webpack_require__.p) {
      const publicPath = __webpack_require__.p as string;
      const snapshot = getGlobalSnapshotInfoByModuleInfo({
        version: options.version,
        name: options.name,
      });
      if (
        !snapshot ||
        !('ssrRemoteEntry' in snapshot) ||
        !snapshot.ssrRemoteEntry
      ) {
        return args;
      }
      const ssrPath =
        snapshot.ssrRemoteEntry.split('/').slice(0, -1).join('/') + '/';
      if (!publicPath.endsWith(ssrPath)) {
        __webpack_require__.p = publicPath + ssrPath;
      }
    }
    return args;
  },
});
export default correctSsrPublicPathPlugin;
