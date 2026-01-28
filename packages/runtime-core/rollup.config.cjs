const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

const adjustSourceMapPath = (relativePath) => {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized.startsWith('../../src/')) {
    return normalized.replace('../../src/', '../src/');
  }
  return normalized;
};

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
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
      sourcemap: true,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      sourcemapPathTransform: adjustSourceMapPath,
      entryFileNames: c.format === 'cjs' ? '[name].cjs' : '[name].mjs',
      chunkFileNames: c.format === 'cjs' ? '[name].cjs' : '[name].mjs',
      ...(c.format === 'cjs' ? { externalLiveBindings: false } : {}),
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      sourcemap: true,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      sourcemapPathTransform: adjustSourceMapPath,
      entryFileNames:
        rollupConfig.output.format === 'cjs' ? '[name].cjs' : '[name].mjs',
      chunkFileNames:
        rollupConfig.output.format === 'cjs' ? '[name].cjs' : '[name].mjs',
      ...(rollupConfig.output.format === 'cjs'
        ? { externalLiveBindings: false }
        : {}),
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
