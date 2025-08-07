import type {
  Federation,
  FederationRuntimePlugin,
} from '@module-federation/runtime';

declare global {
  var __DEV__: boolean;
  var __METRO_GLOBAL_PREFIX__: string;
  var __FUSEBOX_HAS_FULL_CONSOLE_SUPPORT__: boolean;
  var __loadBundleAsync: (entry: string) => Promise<void>;
  var __FEDERATION__: Federation;
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

const MetroCorePlugin: () => FederationRuntimePlugin = () => ({
  name: 'metro-core-plugin',
  loadEntry: async ({ remoteInfo }) => {
    const { entry, entryGlobalName } = remoteInfo;

    const __loadBundleAsync =
      // @ts-expect-error dynamic key access on global object
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
        throw new Error(`Remote entry ${entryGlobalName} failed to register.`);
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
});

export default MetroCorePlugin;
