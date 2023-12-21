module.exports = (rollupConfig) => {
  rollupConfig.input = {
    index: 'packages/kit/src/index.ts',
    runtime: 'packages/kit/src/runtime.ts',
    'webpack-bundler-runtime': 'packages/kit/src/webpack-bundler-runtime.ts',
    'webpack-plugin': 'packages/kit/src/webpack-plugin.ts',
  };

  return rollupConfig;
};
