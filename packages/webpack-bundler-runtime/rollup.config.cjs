const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, projectOptions) => {
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
