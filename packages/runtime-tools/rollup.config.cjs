module.exports = (rollupConfig) => {
  rollupConfig.input = {
    index: 'packages/runtime-tools/src/index.ts',
    runtime: 'packages/runtime-tools/src/runtime.ts',
    'webpack-bundler-runtime':
      'packages/runtime-tools/src/webpack-bundler-runtime.ts',
    'runtime-core': 'packages/runtime-tools/src/runtime-core.ts',
  };

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
    }));
  } else {
    const baseEntryFileName = rollupConfig.output.entryFileNames.replace(
      /\.[^./]+$/,
      '',
    );
    const baseChunkFileName = rollupConfig.output.chunkFileNames.replace(
      /\.[^./]+$/,
      '',
    );

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
    };
  }

  return rollupConfig;
};
