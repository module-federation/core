import type webpack from 'webpack';

const loadWebpackSources = () => {
  const globalWebpackSources = (
    globalThis as typeof globalThis & {
      __NEXT_MF_WEBPACK_SOURCES__?: typeof import('webpack').sources;
    }
  ).__NEXT_MF_WEBPACK_SOURCES__;

  if (globalWebpackSources) {
    return globalWebpackSources;
  }

  try {
    const resolvedWebpackSources = require.resolve('webpack-sources');
    if (
      resolvedWebpackSources &&
      resolvedWebpackSources !== __filename &&
      !resolvedWebpackSources.endsWith('webpack-sources-shim.js')
    ) {
      return require(
        resolvedWebpackSources,
      ) as typeof import('webpack').sources;
    }
  } catch {
    // continue to webpack fallback
  }

  try {
    const webpackModule = require('webpack') as typeof webpack;
    return webpackModule?.sources;
  } catch {
    return undefined;
  }
};

const webpackSources = loadWebpackSources();

export default webpackSources;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = webpackSources;
}
