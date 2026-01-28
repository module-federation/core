const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  const adjustSourceMapPath = (relativePath) => {
    const normalized = relativePath.replace(/\\/g, '/');
    if (normalized.startsWith('../../src/')) {
      return normalized.replace('../../src/', '../src/');
    }
    return normalized;
  };

  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'packages/sdk/dist' }],
    }),
  );

  rollupConfig.external = [/@module-federation/, 'isomorphic-rslog'];

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
      minifyInternalExports: true,
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
      minifyInternalExports: true,
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

  return rollupConfig;
};
