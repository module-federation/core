import type webpack from 'webpack';

const webpackSources = (
  globalThis as typeof globalThis & {
    __NEXT_MF_WEBPACK_SOURCES__?: typeof import('webpack').sources;
  }
).__NEXT_MF_WEBPACK_SOURCES__;

export default webpackSources;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = webpackSources;
}
