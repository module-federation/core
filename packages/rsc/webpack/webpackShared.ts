/**
 * Shared webpack layer and loader configuration for RSC + MF apps.
 * Keep this minimal to avoid over-abstracting, but centralize
 * the pieces that must stay identical between host and remote.
 */

export const WEBPACK_LAYERS = {
  rsc: 'rsc',
  ssr: 'ssr',
  client: 'client',
  shared: 'shared',
};

export const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [['@babel/preset-react', { runtime: 'automatic' }]],
  },
};
