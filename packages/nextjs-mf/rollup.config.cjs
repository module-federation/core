const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.input = {
    index: 'packages/nextjs-mf/src/index.ts',
    'utils/index': 'packages/nextjs-mf/utils/index.ts',
  };

  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/nextjs-mf/README.md', dest: 'packages/nextjs-mf/dist' },
        { src: 'packages/nextjs-mf/LICENSE', dest: 'packages/nextjs-mf/dist' },
      ],
    }),
  );

  rollupConfig.external = [
    /@module-federation/,
    'fast-glob',
    'webpack',
    'next',
    'react',
    'react-dom',
    'styled-jsx',
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