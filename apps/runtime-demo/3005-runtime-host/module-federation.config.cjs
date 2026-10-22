const path = require('node:path');

module.exports = {
  name: 'runtime_host',
  experiments: { asyncStartup: true },
  runtimePlugins: [
    path.resolve(__dirname, 'src/observability-runtime-plugin.ts'),
  ],
  remotes: {
    remote1: 'runtime_remote1@http://127.0.0.1:3006/mf-manifest.json',
  },
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/Button.tsx',
  },
  dts: {
    tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
  },
  shareStrategy: 'loaded-first',
  shared: {
    lodash: {
      singleton: true,
      requiredVersion: '^4.0.0',
    },
    antd: {
      singleton: true,
      requiredVersion: '^4.0.0',
    },
    react: {
      singleton: true,
      requiredVersion: '^18.2.0',
    },
    'react/': {
      singleton: true,
      requiredVersion: '^18.2.0',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.2.0',
    },
    'react-dom/': {
      singleton: true,
      requiredVersion: '^18.2.0',
    },
  },
};
