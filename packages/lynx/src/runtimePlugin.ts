import type {
  ModuleFederationRuntimePlugin,
  RemoteEntryExports,
  RemoteInfo,
} from '@module-federation/runtime-core/types';

import {
  isBundleEntry,
  getTimeout,
  loadBundleEntry,
  loadJavaScriptEntry,
  loadScriptForEntry,
  PREPARE_REMOTE_ENTRY_MTS,
} from './runtimeEntryLoader';
import {
  getLynxRealm,
  getLynxRuntime,
  isRecord,
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

const handlesLynxRemote = ({
  entry,
  type,
}: Pick<RemoteInfo, 'entry' | 'type'>): boolean =>
  type === 'lynx' || type === 'lynx-js' || isBundleEntry(entry);

export default function lynxRuntimePlugin(
  options: LynxRuntimePluginOptions = {},
): ModuleFederationRuntimePlugin {
  const entryCache = new Map<string, Promise<RemoteEntryExports>>();
  const timeout = getTimeout(options.timeout);
  const realmLayers = options.realmLayers ?? {
    background: 'background',
    'main-thread': 'main-thread',
  };
  const globalObject = globalThis as LynxGlobal;
  const lynx = getLynxRuntime(globalObject);
  if (
    lynx?.loadScript &&
    getLynxRealm(lynx) === 'main-thread' &&
    typeof globalObject[PREPARE_REMOTE_ENTRY_MTS] !== 'function'
  ) {
    globalObject[PREPARE_REMOTE_ENTRY_MTS] = (payload: unknown): boolean => {
      if (
        !isRecord(payload) ||
        typeof payload.bundleName !== 'string' ||
        typeof payload.entry !== 'string' ||
        typeof payload.sectionPath !== 'string'
      ) {
        return false;
      }
      try {
        loadScriptForEntry(
          lynx,
          payload.sectionPath,
          payload.bundleName,
          payload.entry,
          globalObject,
        );
        return true;
      } catch {
        return false;
      }
    };
  }

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
      if (!handlesLynxRemote(remoteInfo)) {
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
            realmLayers[realm],
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
    async generatePreloadAssets({ remoteInfo }) {
      if (!handlesLynxRemote(remoteInfo)) {
        return undefined;
      }
      return {
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: [],
      };
    },
  };
}
