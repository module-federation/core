const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.input = {
    index: 'packages/enhanced/src/index.ts',
    webpack: 'packages/enhanced/src/webpack.ts',
    rspack: 'packages/enhanced/src/rspack.ts',
    runtime: 'packages/enhanced/src/runtime.ts',
    prefetch: 'packages/enhanced/src/prefetch.ts',
  };

  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/enhanced/README.md', dest: 'packages/enhanced/dist' },
        { src: 'packages/enhanced/LICENSE', dest: 'packages/enhanced/dist' },
      ],
    }),
  );

  rollupConfig.external = [
    /@module-federation/,
    'webpack',
    'schema-utils',
    'btoa',
    'upath',
    'ajv',
    'enhanced-resolve',
    'terser',
  ];

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