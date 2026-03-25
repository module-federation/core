import type {
  Federation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import type { ICacheLayer } from './cache-interface';
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

/**
 * Extract bundleUrl → hash map from a manifest.
 * Used by afterResolve to register hashes, and passed as callback
 * to the cache layer for manifest polling.
 */
function extractBundleHashes(
  manifest: any,
  manifestUrl: string,
): Map<string, string> {
  const hashes = new Map<string, string>();

  const rawPublicPath = manifest?.metaData?.publicPath ?? '';
  const resolvedPublicPath =
    rawPublicPath &&
    rawPublicPath !== 'auto' &&
    /^https?:\/\//.test(rawPublicPath)
      ? rawPublicPath
      : manifestUrl.replace(/\/[^/]*$/, '');

  function addHashes(items: any[] | undefined) {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      const hash = (item as any)?.hash;
      const syncJs = item?.assets?.js?.sync;
      if (hash && syncJs) {
        for (const assetPath of syncJs) {
          // In dev, asset paths use source extensions (.tsx/.ts) — normalize to .bundle
          const bundlePath = assetPath.replace(/\.\w+$/, '.bundle');
          const fullUrl = resolvedPublicPath
            ? `${resolvedPublicPath.replace(/\/+$/, '')}/${bundlePath.replace(/^\.?\//, '')}`
            : bundlePath;
          hashes.set(fullUrl, hash);
        }
      }
    }
  }

  addHashes(manifest?.exposes);
  addHashes(manifest?.shared);

  return hashes;
}

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
      // Register bundle hashes with cache layer for integrity verification
      try {
        const cacheLayer = (globalThis as any).__MFE_CACHE_LAYER__ as
          | ICacheLayer
          | undefined;
        if (!cacheLayer) return args;

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
              cacheLayer.registerBundleHash(remoteInfo.entry, containerHash);
            }

            // Exposed + shared bundle hashes
            const hashes = extractBundleHashes(manifest, manifestUrl);
            for (const [url, hash] of hashes) {
              cacheLayer.registerBundleHash(url, hash);
            }

            // Register manifest source for polling
            cacheLayer.registerManifestSource(
              manifestUrl,
              remoteInfo.entry ?? '',
              extractBundleHashes,
              buildUrlForEntryBundle,
            );
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
