const copy = require('rollup-plugin-copy');
const createRefOptimizer = require('@module-federation/ref-optimizer');

module.exports = (rollupConfig, projectOptions) => {
  // Find the TypeScript plugin index
  const tsPluginIndex = rollupConfig.plugins.findIndex(
    (p) => p.name === 'rpt2' || p.name === 'typescript',
  );

  // Create the ref-optimizer plugin instance
  const refOptimizerPlugin = createRefOptimizer({
    patterns: ['packages/webpack-bundler-runtime/src/**/*.{ts,tsx}'],
    virtualModuleId: 'virtual:property-literals-webpack-bundler',
    manglingOptions: {
      minOccurrences: 3,
      prefix: 'WB_',
      excludeBuiltIns: true,
    },
    analyzerOptions: {
      excludeBuiltIns: true,
      minOccurrences: 3,
    },
  });

  // Insert the ref-optimizer plugin after the TypeScript plugin
  if (tsPluginIndex !== -1) {
    rollupConfig.plugins.splice(tsPluginIndex + 1, 0, refOptimizerPlugin);
  } else {
    rollupConfig.plugins.push(refOptimizerPlugin);
  }

  // Enable aggressive tree-shaking
  rollupConfig.treeshake = { preset: 'recommended' };

  rollupConfig.external = [
    /@module-federation\/runtime/,
    /@module-federation\/sdk/,
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

  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/webpack-bundler-runtime/LICENSE',
          dest: 'packages/webpack-bundler-runtime/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
