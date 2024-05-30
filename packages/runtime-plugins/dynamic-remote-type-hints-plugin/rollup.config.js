const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/dynamic-remote-type-hints-runtime-plugin/LICENSE',
          dest: 'packages/dynamic-remote-type-hints-runtime-plugin/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
