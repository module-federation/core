const path = require('node:path');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');

const nodeRuntimePlugin =
  require.resolve('@module-federation/node/runtimePlugin');
const sourcePath = path.resolve(__dirname, 'src');

const common = (name, entry, outputPath) => ({
  name,
  mode: 'production',
  target: 'async-node',
  context: __dirname,
  cache: false,
  devtool: false,
  entry: {
    main: path.resolve(__dirname, entry),
  },
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: '[name].js',
    chunkFilename: '[name]-[contenthash].js',
    clean: true,
    publicPath: 'auto',
    uniqueName: name,
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: sourcePath,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
              target: 'es2022',
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  optimization: {
    chunkIds: 'named',
    minimize: false,
    moduleIds: 'named',
    runtimeChunk: false,
  },
});

const provider = (name, entry, outputPath) => ({
  ...common(name, entry, outputPath),
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename: 'remoteEntry.js',
      library: { type: 'commonjs-module', name },
      dts: false,
      manifest: true,
      runtimePlugins: [nodeRuntimePlugin],
      exposes: {
        './contribution': path.resolve(__dirname, entry),
      },
    }),
  ],
});

const gatewayBase = common('skills_mcp_gateway', 'src/main.ts', 'dist/gateway');
const gateway = {
  ...gatewayBase,
  externals: {
    '@modelcontextprotocol/server': 'commonjs @modelcontextprotocol/server',
    '@modelcontextprotocol/server/stdio':
      'commonjs @modelcontextprotocol/server/stdio',
    '@module-federation/runtime': 'commonjs @module-federation/runtime',
    'zod/v4': 'commonjs zod/v4',
  },
  output: {
    ...gatewayBase.output,
    filename: '[name].cjs',
    chunkFilename: '[name]-[contenthash].cjs',
  },
};

module.exports = [
  provider(
    'runtime_skills_provider',
    'src/providers/runtime.ts',
    'dist/runtime-provider',
  ),
  provider(
    'delivery_skills_provider',
    'src/providers/delivery.ts',
    'dist/delivery-provider',
  ),
  gateway,
];
