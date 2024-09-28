const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.input = {
    index: 'packages/node/src/index.ts',
    utils: 'packages/node/src/utils/index.ts',
    runtimePlugin: 'packages/node/src/runtimePlugin.ts',
    // "types": "packages/node/src/types/index.ts",
    recordDynamicRemoteEntryHashPlugin:
      'packages/node/src/recordDynamicRemoteEntryHashPlugin.ts',
    AutomaticPublicPathPlugin:
      'packages/node/src/plugins/AutomaticPublicPathPlugin.ts',
    CommonJsChunkLoadingPlugin:
      'packages/node/src/plugins/CommonJsChunkLoadingPlugin.ts',
    DynamicFilesystemChunkLoadingRuntimeModule:
      'packages/node/src/plugins/DynamicFilesystemChunkLoadingRuntimeModule.ts',
    EntryChunkTrackerPlugin:
      'packages/node/src/plugins/EntryChunkTrackerPlugin.ts',
    NodeFederationPlugin: 'packages/node/src/plugins/NodeFederationPlugin.ts',
    RemotePublicPathRuntimeModule:
      'packages/node/src/plugins/RemotePublicPathRuntimeModule.ts',
    StreamingTargetPlugin: 'packages/node/src/plugins/StreamingTargetPlugin.ts',
    UniversalFederationPlugin:
      'packages/node/src/plugins/UniversalFederationPlugin.ts',
    UniverseEntryChunkTrackerPlugin:
      'packages/node/src/plugins/UniverseEntryChunkTrackerPlugin.ts',
    webpackChunkUtilities: 'packages/node/src/plugins/webpackChunkUtilities.ts',
  };

  const project = projectOptions.project;
  const pkg = require(project);

  rollupConfig.output = {
    ...rollupConfig.output,
    manualChunks: (id) => {
      if (id.includes('@swc/helpers')) {
        return 'polyfills';
      }
    },
  };

  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
    }),
    copy({
      targets: [{ src: 'packages/node/LICENSE', dest: 'packages/node/dist' }],
    }),
  );

  return rollupConfig;
};
