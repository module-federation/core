const copy = require('rollup-plugin-copy');
const createRefOptimizer = require('@module-federation/ref-optimizer');

module.exports = (rollupConfig, _projectOptions) => {
  // Log the initial plugin order
  console.log(
    '[sdk build] Initial Rollup plugins:',
    rollupConfig.plugins.map((p) => p.name),
  );

  // Find the TypeScript plugin index
  const tsPluginIndex = rollupConfig.plugins.findIndex(
    (p) => p.name === 'rpt2' || p.name === 'typescript',
  );

  // Create the ref-optimizer plugin instance
  const refOptimizerPlugin = createRefOptimizer({
    patterns: ['packages/sdk/src/**/*.{ts,tsx}'],
    virtualModuleId: 'virtual:property-literals-sdk',
    manglingOptions: {
      minOccurrences: 3,
      prefix: 'S_',
      excludeBuiltIns: true,
    },
    analyzerOptions: {
      excludeBuiltIns: true,
      minOccurrences: 3,
    },
    onAnalysisComplete: (results) => {
      console.log(
        `[sdk build] Ref Optimizer Analysis: ${results.length} total unique properties found.`,
      );
      const topProperties = [...results]
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 5);
      console.log('  Top properties by occurrences:');
      topProperties.forEach((p) =>
        console.log(
          `    - ${p.name} (${p.occurrences} occurrences, safe: ${p.safeToMangle})`,
        ),
      );
    },
    onManglingCandidates: (candidates) => {
      console.log(
        `[sdk build] Ref Optimizer Mangling Candidates: ${candidates.length} found.`,
      );
      candidates.slice(0, 5).forEach((prop) => {
        console.log(`    - ${prop.propertyName} -> ${prop.constantName}`);
      });
    },
  });

  // Insert the ref-optimizer plugin after the TypeScript plugin
  if (tsPluginIndex !== -1) {
    rollupConfig.plugins.splice(tsPluginIndex + 1, 0, refOptimizerPlugin);
    console.log(
      '[sdk build] Inserted ref-optimizer plugin after TypeScript plugin',
    );
  } else {
    console.warn(
      '[sdk build] TypeScript plugin not found, adding ref-optimizer at the end',
    );
    rollupConfig.plugins.push(refOptimizerPlugin);
  }

  // Log the final plugin order
  console.log(
    '[sdk build] Final Rollup plugins:',
    rollupConfig.plugins.map((p) => p.name),
  );

  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'packages/sdk/dist' }],
    }),
  );

  rollupConfig.external = [/@module-federation/, 'isomorphic-rslog'];

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      minifyInternalExports: true,
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
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      minifyInternalExports: true,
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
