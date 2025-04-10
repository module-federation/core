module.exports = (rollupConfig) => {
  rollupConfig.input = {
    index: 'packages/runtime-tools/src/index.ts',
    runtime: 'packages/runtime-tools/src/runtime.ts',
    'webpack-bundler-runtime':
      'packages/runtime-tools/src/webpack-bundler-runtime.ts',
    'runtime-core': 'packages/runtime-tools/src/runtime-core.ts',
  };

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => {
      const baseEntryFileName = c.entryFileNames.replace(/\.[^./]+$/, '');
      const baseChunkFileName = c.chunkFileNames.replace(/\.[^./]+$/, '');

      return {
        ...c,
        hoistTransitiveImports: false,
        entryFileNames:
          c.format === 'cjs'
            ? `${baseEntryFileName}.cjs`
            : `${baseEntryFileName}.js`,
        chunkFileNames:
          c.format === 'cjs'
            ? `${baseChunkFileName}.cjs`
            : `${baseChunkFileName}.js`,
        ...(c.format === 'cjs' ? { externalLiveBindings: false } : {}),
      };
    });
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
          ? `${baseEntryFileName}.cjs`
          : `${baseEntryFileName}.js`,
      chunkFileNames:
        rollupConfig.output.format === 'cjs'
          ? `${baseChunkFileName}.cjs`
          : `${baseChunkFileName}.js`,
      ...(rollupConfig.output.format === 'cjs'
        ? { externalLiveBindings: false }
        : {}),
    };
  }

  return rollupConfig;
};
