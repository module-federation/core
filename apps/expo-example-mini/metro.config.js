const path = require('node:path');
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const { withModuleFederation } = require('@module-federation/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: { useWatchman: false },
  watchFolders: [
    path.resolve(__dirname, '../../node_modules'),
    path.resolve(__dirname, '../../packages/core'),
  ],
};

module.exports = withModuleFederation(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    name: 'MFExpoExampleMini',
    filename: 'expo-mini-container.bundle',
    exposes: {
      './info': './src/info.tsx',
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
        version: '4.17.21',
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
