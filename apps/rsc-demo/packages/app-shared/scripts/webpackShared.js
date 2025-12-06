'use strict';

/**
 * Shared webpack layer and loader configuration for app1/app2.
 * Keep this minimal to avoid over-abstracting, but centralize
 * the pieces that must stay identical between host and remote.
 */

const WEBPACK_LAYERS = {
  rsc: 'rsc',
  ssr: 'ssr',
  client: 'client',
  shared: 'shared',
};

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [['@babel/preset-react', {runtime: 'automatic'}]],
  },
};

module.exports = {
  WEBPACK_LAYERS,
  babelLoader,
};
