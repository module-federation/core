const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/manifest/LICENSE', dest: 'packages/manifest/dist' },
      ],
    }),
  );

  return rollupConfig;
};
