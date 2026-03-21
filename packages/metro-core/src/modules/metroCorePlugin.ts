import type {
  Federation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
declare global {
  // @ts-expect-error -- Intentional redeclaration for Metro/React Native runtime global.
  // eslint-disable-next-line no-var
  var __DEV__: boolean;
  // eslint-disable-next-line no-var
  var __METRO_GLOBAL_PREFIX__: string;
  // eslint-disable-next-line no-var
  var __FUSEBOX_HAS_FULL_CONSOLE_SUPPORT__: boolean;
  // eslint-disable-next-line no-var
  var __loadBundleAsync: (entry: string) => Promise<void>;
  // eslint-disable-next-line no-var
  var __FEDERATION__: Federation;
}

// Global map: bundleUrl → expected bundleHash from manifest
// Populated by afterResolve hook, consumed by asyncRequire.ts cache layer
const bundleHashMap: Record<string, string> =
  (globalThis as any).__MFE_BUNDLE_HASHES__ ??
  ((globalThis as any).__MFE_BUNDLE_HASHES__ = {});

const getQueryParams = () => {
  const isFuseboxEnabled = !!globalThis.__FUSEBOX_HAS_FULL_CONSOLE_SUPPORT__;
  const queryParams: Record<string, string> = {
    platform: require('react-native').Platform.OS,
    dev: 'true',
    lazy: 'true',
    minify: 'false',
    runModule: 'true',
    modulesOnly: 'false',
  };

  if (isFuseboxEnabled) {
    queryParams.excludeSource = 'true';
    queryParams.sourcePaths = 'url-server';
  }

  return new URLSearchParams(queryParams);
};

const buildUrlForEntryBundle = (entry: string) => {
  if (__DEV__) {
    return `${entry}?${getQueryParams().toString()}`;
  }
  return entry;
};

const MetroCorePlugin: () => ModuleFederationRuntimePlugin = () => {
  return {
    name: 'metro-core-plugin',
    afterResolve: (args) => {
      // Extract bundleHash from manifest and store in global map for asyncRequire.ts
      try {
        const { origin, remoteInfo, remote } = args;
        const manifestUrl =
          'entry' in remote ? (remote as any).entry : undefined;
        if (manifestUrl && origin.snapshotHandler?.manifestCache) {
          const manifest =
            origin.snapshotHandler.manifestCache.get(manifestUrl);
          if (manifest) {
            // Container bundle hash
            const containerHash = (manifest.metaData?.buildInfo as any)?.hash;
            if (containerHash && remoteInfo.entry) {
              bundleHashMap[remoteInfo.entry] = containerHash;
            }
            // Resolve actual publicPath for hash key construction.
            // In dev mode, manifest.publicPath is "auto" — resolve to actual server URL.
            const rawPublicPath =
              'publicPath' in manifest.metaData
                ? manifest.metaData.publicPath
                : '';
            const resolvedPublicPath =
              rawPublicPath &&
              rawPublicPath !== 'auto' &&
              /^https?:\/\//.test(rawPublicPath)
                ? rawPublicPath
                : manifestUrl
                  ? manifestUrl.replace(/\/[^/]*$/, '')
                  : '';

            // Exposed bundle hashes — keyed by resolvedPublicPath + bundle path
            if (Array.isArray(manifest.exposes)) {
              for (const expose of manifest.exposes) {
                const hash = (expose as any).hash;
                const syncJs = expose.assets?.js?.sync;
                if (hash && syncJs) {
                  for (const assetPath of syncJs) {
                    // In dev, asset paths use source extensions (.tsx/.ts) — normalize to .bundle
                    const bundlePath = assetPath.replace(/\.\w+$/, '.bundle');
                    const fullUrl = resolvedPublicPath
                      ? `${resolvedPublicPath.replace(/\/+$/, '')}/${bundlePath.replace(/^\.?\//, '')}`
                      : bundlePath;
                    bundleHashMap[fullUrl] = hash;
                  }
                }
              }
            }
            // Shared bundle hashes
            if (Array.isArray(manifest.shared)) {
              for (const shared of manifest.shared) {
                const hash = (shared as any).hash;
                const syncJs = shared.assets?.js?.sync;
                if (hash && syncJs) {
                  for (const assetPath of syncJs) {
                    const bundlePath = assetPath.replace(/\.\w+$/, '.bundle');
                    const fullUrl = resolvedPublicPath
                      ? `${resolvedPublicPath.replace(/\/+$/, '')}/${bundlePath.replace(/^\.?\//, '')}`
                      : bundlePath;
                    bundleHashMap[fullUrl] = hash;
                  }
                }
              }
            }
          }
        }
      } catch {
        // non-critical — hash validation is best-effort
      }
      return args;
    },
    loadEntry: async ({ remoteInfo }) => {
      const { entry, entryGlobalName } = remoteInfo;

      const __loadBundleAsync =
        globalThis[`${__METRO_GLOBAL_PREFIX__ ?? ''}__loadBundleAsync`];

      const loadBundleAsync =
        __loadBundleAsync as typeof globalThis.__loadBundleAsync;

      if (!loadBundleAsync) {
        throw new Error('loadBundleAsync is not defined');
      }

      try {
        const entryUrl = buildUrlForEntryBundle(entry);
        await loadBundleAsync(entryUrl);

        if (!globalThis.__FEDERATION__.__NATIVE__[entryGlobalName]) {
          throw new Error(
            `Remote entry ${entryGlobalName} failed to register.`,
          );
        }

        globalThis.__FEDERATION__.__NATIVE__[entryGlobalName].origin = entryUrl;

        return globalThis.__FEDERATION__.__NATIVE__[entryGlobalName].exports;
      } catch (error) {
        throw new Error(
          `Failed to load remote entry: ${entryGlobalName}. Reason: ${error}`,
        );
      }
    },
    generatePreloadAssets: async () => {
      // noop for compatibility
      return Promise.resolve({
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: [],
      });
    },
  };
};

export default MetroCorePlugin;
