const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/data-prefetch/LICENSE',
          dest: 'packages/data-prefetch/dist',
        },
      ],
    }),
  );
  rollupConfig.input = {
    index: 'packages/data-prefetch/src/index.ts',
    react: 'packages/data-prefetch/src/react/index.ts',
    cli: 'packages/data-prefetch/src/cli/index.ts',
    babel: 'packages/data-prefetch/src/cli/babel.ts',
    universal: 'packages/data-prefetch/src/universal/index.ts',
    plugin: 'packages/data-prefetch/src/plugin.ts',
  };

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
        c.format === 'esm'
          ? c.entryFileNames.replace('.js', '.mjs')
          : c.entryFileNames,
      chunkFileNames:
        c.format === 'esm'
          ? c.chunkFileNames.replace('.js', '.mjs')
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
        rollupConfig.output.format === 'esm'
          ? rollupConfig.output.entryFileNames.replace('.js', '.mjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'esm'
          ? rollupConfig.output.chunkFileNames.replace('.js', '.mjs')
          : rollupConfig.output.chunkFileNames,
    };
  }

  // rollupConfig.external = [/@module-federation/];
  return rollupConfig;
};
