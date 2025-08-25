const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.input = {
    index: 'packages/storybook-addon/src/index.ts',
    preset: 'packages/storybook-addon/preset.ts',
  };

  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/storybook-addon/README.md', dest: 'packages/storybook-addon/dist' },
        { src: 'packages/storybook-addon/LICENSE', dest: 'packages/storybook-addon/dist' },
      ],
    }),
  );

  rollupConfig.external = [
    /@module-federation/,
    /@storybook/,
    /@rsbuild/,
    /@nx/,
    'webpack',
    'webpack-virtual-modules',
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

  return rollupConfig;
};