const path = require('path');

// ESM-output federation host for Node.js.
//
// The host bundle itself is a native ES module (output.module +
// chunkFormat/chunkLoading 'module'/'import'). The Module Federation runtime
// is bundled in; the remote entry URL is imported at runtime with a native
// dynamic `import()` (the node runtime plugin's `loadEntry` bridge, see
// @module-federation/node/runtimePlugin), which is what routes remote loading
// through Node's http(s) loader hooks instead of the vm-based 'async-node'
// machinery used by the sibling node-host example.
module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
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
      environment: {
        module: true,
        dynamicImport: true,
      },
      clean: true,
    },
    optimization: {
      chunkIds: 'named',
      minimize: isProduction,
      runtimeChunk: false,
    },
  };
};
