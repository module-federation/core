module.exports = (rollupConfig) => {
  rollupConfig.input = {
    index: 'packages/kit/src/index.ts',
    runtime: 'packages/kit/src/runtime.ts',
    'webpack-bundler-runtime': 'packages/kit/src/webpack-bundler-runtime.ts',
  };

  return rollupConfig;
};
