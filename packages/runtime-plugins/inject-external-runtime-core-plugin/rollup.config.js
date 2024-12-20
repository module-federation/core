const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/runtime-plugins/inject-external-runtime-core-plugin/LICENSE',
          dest: 'packages/runtime-plugins/inject-external-runtime-core-plugin/dist',
        },
      ],
    }),
  );

  rollupConfig.external = [/@module-federation/];

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

  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
    }),
  );
  return rollupConfig;
};
