const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.output.dynamicImportInCjs = true;
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
