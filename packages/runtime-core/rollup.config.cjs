const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');
const createRefOptimizer = require('@module-federation/ref-optimizer');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  // Find the TypeScript plugin index
  const tsPluginIndex = rollupConfig.plugins.findIndex(
    (p) => p.name === 'rpt2' || p.name === 'typescript',
  );

  // --- Aggressive Mode Control ---
  // Set to true for aggressive mode (minOccurrences: 1, include built-ins)
  // Set to false for default mode (respects analyzerOptions/manglingOptions below)
  const aggressiveMode = true;
  // ------------------------------

  // Create the ref-optimizer plugin instance
  const refOptimizerPlugin = createRefOptimizer({
    aggressive: false, // Pass the aggressive mode flag
    patterns: ['packages/runtime-core/src/**/*.{ts,tsx}'],
    virtualModuleId: 'virtual:property-literals-runtime-core',
    manglingOptions: {
      minOccurrences: 3, // Default when not aggressive
      prefix: 'RC_',
      excludeBuiltIns: true, // Default when not aggressive
    },
    // These options are used only if aggressiveMode is false
    analyzerOptions: {
      excludeBuiltIns: true, // Default when not aggressive
      minOccurrences: 3, // Default when not aggressive
    },
  });

  // Insert the ref-optimizer plugin after the TypeScript plugin
  if (tsPluginIndex !== -1) {
    rollupConfig.plugins.splice(tsPluginIndex + 1, 0, refOptimizerPlugin);
  } else {
    rollupConfig.plugins.push(refOptimizerPlugin);
  }

  rollupConfig.input = {
    index: 'packages/runtime-core/src/index.ts',
    types: 'packages/runtime-core/src/types.ts',
  };

  const pkg = require('./package.json');

  if (rollupConfig.output.format === 'esm' && FEDERATION_DEBUG) {
    rollupConfig.output.format = 'iife';
    rollupConfig.output.inlineDynamicImports = true;
    delete rollupConfig.external;
    delete rollupConfig.input.type;
    delete rollupConfig.input.helpers;
  }

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      entryFileNames:
        c.format === 'cjs'
          ? c.entryFileNames.replace('.js', '.cjs')
          : c.entryFileNames,
      chunkFileNames:
        c.format === 'cjs'
          ? c.chunkFileNames.replace('.js', '.cjs')
          : c.chunkFileNames,
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
      entryFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.entryFileNames.replace('.js', '.cjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.chunkFileNames.replace('.js', '.cjs')
          : rollupConfig.output.chunkFileNames,
    };
  }

  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
    }),
    copy({
      targets: [
        {
          src: 'packages/runtime-core/LICENSE',
          dest: 'packages/runtime-core/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
