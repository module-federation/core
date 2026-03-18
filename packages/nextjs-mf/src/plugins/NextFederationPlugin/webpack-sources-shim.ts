const localWebpackPathEnvKey = 'NEXT_MF_LOCAL_WEBPACK_PATH';

const resolveWebpackSourcesFromModuleExports = (
  exportsValue: unknown,
): typeof import('webpack').sources | undefined => {
  if (!exportsValue || typeof exportsValue !== 'object') {
    return undefined;
  }

  const directSources = (exportsValue as { sources?: unknown }).sources;
  if (
    directSources &&
    typeof directSources === 'object' &&
    'CachedSource' in directSources
  ) {
    return directSources as typeof import('webpack').sources;
  }

  const nestedWebpack = (exportsValue as { webpack?: unknown }).webpack;
  if (nestedWebpack && typeof nestedWebpack === 'object') {
    const nestedSources = (nestedWebpack as { sources?: unknown }).sources;
    if (
      nestedSources &&
      typeof nestedSources === 'object' &&
      'CachedSource' in nestedSources
    ) {
      return nestedSources as typeof import('webpack').sources;
    }
  }

  return undefined;
};

const resolveWebpackSourcesFromCache = ():
  | typeof import('webpack').sources
  | undefined => {
  for (const cacheEntry of Object.values(require.cache)) {
    const webpackSources = resolveWebpackSourcesFromModuleExports(
      cacheEntry?.exports,
    );
    if (webpackSources) {
      return webpackSources;
    }
  }

  return undefined;
};

const loadWebpackSources = (): typeof import('webpack').sources | undefined => {
  const localWebpackPath = process.env[localWebpackPathEnvKey];

  if (localWebpackPath) {
    const cachedWebpack = require.cache[localWebpackPath]?.exports;
    const localWebpackSources =
      resolveWebpackSourcesFromModuleExports(cachedWebpack);
    if (localWebpackSources) {
      return localWebpackSources;
    }
  }

  return resolveWebpackSourcesFromCache();
};

const webpackSources = loadWebpackSources();

export default webpackSources;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = webpackSources;
}
