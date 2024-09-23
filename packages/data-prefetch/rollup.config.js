const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/data-prefetch/LICENSE',
          dest: 'packages/data-prefetch/dist',
        },
      ],
    }),
  );

  rollupConfig.external = [/@module-federation/];
  return rollupConfig;
};
