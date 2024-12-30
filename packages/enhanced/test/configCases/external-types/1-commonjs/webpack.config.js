const { ModuleFederationPlugin } = require('../../../../dist/src');

const common = {
  mode: 'development',
  target: 'node',
  devtool: false,
  entry: {
    main: './index.js',
  },
  optimization: {
  },
};

const commonMF = {
  runtime: false,
  exposes: {
    './ComponentB': './ComponentB',
    './ComponentC': './ComponentC',
  },
  shared: ['react'],
};

/** @type {import("../../../../").Configuration[]} */
module.exports = [
  {
    ...common,
    output: {
      filename: '[name].js',
      uniqueName: '1-container-full',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'container',
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remoteType: 'commonjs-module',
        remotes: {
          containerB: './container.js',
          // containerC: 'nothing@./container.js',
        },
        runtimePlugins: [require.resolve('./runtimePlugin.js')],
        ...commonMF,
      }),
    ],
  },
  {
    ...common,
    experiments: {
      outputModule: true,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: '1-container-full-mjs',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'container',
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerB: './container.mjs',
        },
        ...commonMF,
      }),
    ],
    target: 'node14',
  },
];
