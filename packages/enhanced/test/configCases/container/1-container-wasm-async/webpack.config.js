const { ContainerPlugin } = require('../../../../src/index');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  experiments: {
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
    ],
  },
  plugins: [
    new ContainerPlugin({
      name: 'wasmContainer',
      filename: 'remoteEntry.js',
      exposes: {
        './WasmModule': './wasm-module.wasm',
        './App': './index.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
