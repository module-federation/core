const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/managers/LICENSE', dest: 'packages/managers/dist' },
      ],
    }),
  );

  return rollupConfig;
};
