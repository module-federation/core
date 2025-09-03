const path = require('node:path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const {withModuleFederation} = require('@module-federation/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {useWatchman: false},
  watchFolders: [
    path.resolve(__dirname, '../../node_modules'),
    path.resolve(__dirname, '../../packages/core'),
  ],
};

module.exports = withModuleFederation(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    name: 'MFExampleNestedMini',
    filename: 'nestedMini.bundle',
    exposes: {
      './nestedMiniInfo': './src/nested-mini-info.tsx',
    },
    remotes: {
      mini: 'mini@http://localhost:8082/mf-manifest.json',
    },
    shared: {
      react: {
        singleton: true,
        eager: false,
        requiredVersion: '19.1.0',
        version: '19.1.0',
        import: false,
      },
      'react-native': {
        singleton: true,
        eager: false,
        requiredVersion: '0.80.0',
        version: '0.80.0',
        import: false,
      },
      lodash: {
        singleton: false,
        eager: false,
        requiredVersion: '4.16.6',
        version: '4.16.6',
      },
    },
    shareStrategy: 'version-first',
  },
  {
    flags: {
      unstable_patchHMRClient: true,
      unstable_patchInitializeCore: true,
      unstable_patchRuntimeRequire: true,
    },
  },
);
