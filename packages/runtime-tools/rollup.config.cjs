module.exports = function (rollupConfig) {
  rollupConfig.input = {
    index: 'packages/runtime-tools/src/index.ts',
    runtime: 'packages/runtime-tools/src/runtime.ts',
    'webpack-bundler-runtime':
      'packages/runtime-tools/src/webpack-bundler-runtime.ts',
    'runtime-core': 'packages/runtime-tools/src/runtime-core.ts',
  };

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map(function (c) {
      var outputConfig = Object.assign({}, c, {
        hoistTransitiveImports: false,
        entryFileNames:
          c.format === 'cjs'
            ? c.entryFileNames.replace('.js', '.cjs')
            : c.entryFileNames,
        chunkFileNames:
          c.format === 'cjs'
            ? c.chunkFileNames.replace('.js', '.cjs')
            : c.chunkFileNames,
      });

      if (c.format === 'cjs') {
        outputConfig.externalLiveBindings = false;
      }

      return outputConfig;
    });
  } else {
    var outputConfig = Object.assign({}, rollupConfig.output, {
      hoistTransitiveImports: false,
      entryFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.entryFileNames.replace('.js', '.cjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.chunkFileNames.replace('.js', '.cjs')
          : rollupConfig.output.chunkFileNames,
    });

    if (rollupConfig.output.format === 'cjs') {
      outputConfig.externalLiveBindings = false;
    }
    rollupConfig.output = outputConfig;
  }

  return rollupConfig;
};
