const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

// ESM-output federation remote for Node.js.
//
// Unlike the sibling `node-remote` example (target: 'async-node' + the
// vm-based @module-federation/node runtime plugin), this build emits native
// ES modules. Chunks are loaded with dynamic `import()` (chunkLoading:
// 'import'), so a Node host running with http(s) loader hooks can pull the
// remote entry AND its async chunks straight through Node's module loader —
// no vm, no custom chunk fetching.
module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    // Plain `node` target (NOT 'async-node'); dynamicImport keeps native
    // import() expressions instead of a chunk-loading shim.
    target: 'node20',
    context: __dirname,
    cache: false,
    devtool: false,
    entry: {
      main: path.resolve(__dirname, 'src/index.js'),
    },
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].mjs',
      chunkFilename: '[name]-[contenthash].mjs',
      module: true,
      chunkFormat: 'module',
      chunkLoading: 'import',
      library: { type: 'module' },
      // Absolute publicPath so chunk URLs resolve over HTTP even when the
      // remote entry is imported from another origin.
      publicPath: 'http://localhost:3030/',
      environment: {
        module: true,
        dynamicImport: true,
      },
      clean: true,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'node_esm_remote',
        filename: 'remoteEntry.mjs',
        library: { type: 'module' },
        dts: false,
        exposes: {
          './greeting': './src/greeting.js',
        },
      }),
    ],
    optimization: {
      chunkIds: 'named',
      minimize: isProduction,
      runtimeChunk: false,
    },
  };
};
