module.exports = (rollupConfig) => {
  rollupConfig.input = {
    index: 'packages/runtime-tools/src/index.ts',
    runtime: 'packages/runtime-tools/src/runtime.ts',
    'webpack-bundler-runtime':
      'packages/runtime-tools/src/webpack-bundler-runtime.ts',
  };

  // Check if output is an array and add hoistTransitiveImports: false
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      hoistTransitiveImports: false,
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      hoistTransitiveImports: false,
    };
  }

  return rollupConfig;
};
