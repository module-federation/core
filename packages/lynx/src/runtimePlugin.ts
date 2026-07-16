import type {
  ModuleFederationRuntimePlugin,
  RemoteEntryExports,
} from '@module-federation/runtime-core/types';

import {
  isBundleEntry,
  getTimeout,
  loadBundleEntry,
  loadJavaScriptEntry,
} from './runtimeEntryLoader';
import {
  getLynxRealm,
  getLynxRuntime,
  LYNX_BUNDLE_REGISTRY,
  type LynxGlobal,
  type LynxRuntimePluginOptions,
} from './runtimeCore';
import {
  patchLynxChunkLoading,
  type LynxWebpackRequire,
} from './runtimeChunkLoading';

export { LYNX_BUNDLE_REGISTRY, patchLynxChunkLoading };
export type { LynxRuntimePluginOptions, LynxWebpackRequire };

declare const __webpack_require__: LynxWebpackRequire;

export default function lynxRuntimePlugin(
  options: LynxRuntimePluginOptions = {},
): ModuleFederationRuntimePlugin {
  const entryCache = new Map<string, Promise<RemoteEntryExports>>();
  const timeout = getTimeout(options.timeout);

  return {
    name: 'lynx-federation-runtime-plugin',
    beforeInit(args) {
      if (typeof __webpack_require__ !== 'undefined') {
        patchLynxChunkLoading(
          __webpack_require__,
          args.options.name,
          globalThis as LynxGlobal,
          timeout,
        );
      }
      return args;
    },
    loadEntry({ remoteInfo }) {
      const { entry, entryGlobalName, type } = remoteInfo;
      const isBundle = type === 'lynx' || isBundleEntry(entry);
      const isJavaScript = type === 'lynx-js';
      if (!isBundle && !isJavaScript) {
        return undefined;
      }

      const globalObject = globalThis as LynxGlobal;
      const lynx = getLynxRuntime(globalObject);

      if (!lynx) {
        throw new Error('Lynx federation requires the Lynx runtime API.');
      }

      const realm = getLynxRealm(lynx);
      const cacheKey = JSON.stringify([entry, entryGlobalName, realm]);
      const cachedEntry = entryCache.get(cacheKey);
      if (cachedEntry) {
        return cachedEntry;
      }

      const loadPromise = isBundle
        ? loadBundleEntry(
            lynx,
            entry,
            entryGlobalName,
            realm,
            globalObject,
            timeout,
          )
        : loadJavaScriptEntry(
            lynx,
            entry,
            entryGlobalName,
            globalObject,
            timeout,
          );
      let cachedPromise: Promise<RemoteEntryExports>;
      cachedPromise = loadPromise.catch((error) => {
        if (entryCache.get(cacheKey) === cachedPromise) {
          entryCache.delete(cacheKey);
        }
        throw error;
      });

      entryCache.set(cacheKey, cachedPromise);
      return cachedPromise;
    },
    async generatePreloadAssets() {
      return {
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: [],
      };
    },
  };
}
