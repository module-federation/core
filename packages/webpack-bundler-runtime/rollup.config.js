const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.external = [rollupConfig.external, /node_modules/];

  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/webpack-bundler-runtime/LICENSE',
          dest: 'dist/packages/webpack-bundler-runtime',
        },
      ],
    }),
  );

  return rollupConfig;
};
