const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.input = {
    index: 'packages/node/src/index.js',
    runtimePlugin: 'packages/node/src/runtimePlugin.js',
    'record-dynamic-remote-entry-hash-plugin': 'packages/node/src/recordDynamicRemoteEntryHashPlugin.js',
    'utils/index': 'packages/node/src/utils/index.js',
    'plugins/NodeFederationPlugin': 'packages/node/src/plugins/NodeFederationPlugin.js',
    'plugins/UniverseEntryChunkTrackerPlugin': 'packages/node/src/plugins/UniverseEntryChunkTrackerPlugin.js',
  };

  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/node/README.md', dest: 'packages/node/dist' },
        { src: 'packages/node/LICENSE', dest: 'packages/node/dist' },
      ],
    }),
  );

  rollupConfig.external = [
    /@module-federation/,
    'btoa',
    'encoding',
    'node-fetch',
    'webpack',
    'react',
    'react-dom',
    'next',
  ];

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      hoistTransitiveImports: false,
      entryFileNames:
        c.format === 'cjs'
          ? c.entryFileNames.replace('.js', '.cjs')
          : c.entryFileNames,
      chunkFileNames:
        c.format === 'cjs'
          ? c.chunkFileNames.replace('.js', '.cjs')
          : c.chunkFileNames,
      ...(c.format === 'cjs' ? { externalLiveBindings: false } : {}),
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      hoistTransitiveImports: false,
      entryFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.entryFileNames.replace('.js', '.cjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.chunkFileNames.replace('.js', '.cjs')
          : rollupConfig.output.chunkFileNames,
      ...(rollupConfig.output.format === 'cjs'
        ? { externalLiveBindings: false }
        : {}),
    };
  }

  return rollupConfig;
};