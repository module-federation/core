/* eslint-env node */
const { ModuleFederationPlugin } = require('../../../../dist/src');

/**
 * This case emits CommonJS and ESM federation bundles into the same output
 * directory so the test can statically inspect how experiments.optimization
 * affects the emitted runtime code.
 */
const commonConfig = {
  optimization: {
    minimize: true,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  exposes: {
    './noop': './noop.js',
  },
  remotes: {
    remote: 'remote@http://localhost:3001/remoteEntry.js',
  },
};

const createConfig = ({
  entry,
  outputModule,
  optimizationTarget,
  disableSnapshot,
  uniqueName,
  containerName,
  filename,
}) => ({
  entry,
  target: outputModule ? 'node14' : 'async-node',
  experiments: outputModule
    ? {
        outputModule: true,
      }
    : undefined,
  output: {
    publicPath: '/',
    chunkFilename: outputModule ? 'module/[id].mjs' : '[id].js',
    uniqueName,
  },
  optimization: commonConfig.optimization,
  plugins: [
    new ModuleFederationPlugin({
      name: containerName,
      filename,
      manifest: true,
      library: outputModule
        ? {
            type: 'module',
          }
        : {
            type: 'commonjs-module',
            name: containerName,
          },
      exposes: commonConfig.exposes,
      remotes: commonConfig.remotes,
      experiments: {
        optimization: {
          target: optimizationTarget,
          disableSnapshot,
        },
      },
    }),
  ],
});

module.exports = [
  createConfig({
    entry: './index.js',
    outputModule: false,
    optimizationTarget: 'web',
    disableSnapshot: true,
    uniqueName: 'experiments-optimization-web-cjs',
    containerName: 'experiments_optimization_web_cjs',
    filename: 'remoteEntry-web.js',
  }),
  createConfig({
    entry: './noop.js',
    outputModule: false,
    optimizationTarget: 'node',
    disableSnapshot: false,
    uniqueName: 'experiments-optimization-node-cjs',
    containerName: 'experiments_optimization_node_cjs',
    filename: 'remoteEntry-node.js',
  }),
  createConfig({
    entry: './noop.js',
    outputModule: true,
    optimizationTarget: 'web',
    disableSnapshot: true,
    uniqueName: 'experiments-optimization-web-esm',
    containerName: 'experiments_optimization_web_esm',
    filename: 'module/remoteEntry-web.mjs',
  }),
  createConfig({
    entry: './noop.js',
    outputModule: true,
    optimizationTarget: 'node',
    disableSnapshot: false,
    uniqueName: 'experiments-optimization-node-esm',
    containerName: 'experiments_optimization_node_esm',
    filename: 'module/remoteEntry-node.mjs',
  }),
];
