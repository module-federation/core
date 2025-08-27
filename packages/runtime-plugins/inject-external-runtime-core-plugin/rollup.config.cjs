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
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
    }),
  );
  return rollupConfig;
};
