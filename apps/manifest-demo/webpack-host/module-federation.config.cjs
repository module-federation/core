const path = require('node:path');

module.exports = {
  runtime: false,
  name: 'manifest_host',
  remotes: {
    remote1: 'webpack_provider@http://localhost:3009/mf-manifest.json',
    'manifest-provider':
      'rspack_manifest_provider@http://localhost:3011/mf-manifest.json',
    'js-entry-provider':
      'rspack_js_entry_provider@http://localhost:3012/remoteEntry.js',
  },
  filename: 'remoteEntry.js',
  shared: {
    lodash: {},
    antd: {},
    'react/': {
      singleton: true,
      requiredVersion: '^18.3.1',
    },
    react: {
      singleton: true,
      requiredVersion: '^18.3.1',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.3.1',
    },
    'react-dom/': {
      singleton: true,
      requiredVersion: '^18.3.1',
    },
  },
  runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
  experiments: {
    provideExternalRuntime: true,
    asyncStartup: true,
  },
};
