const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/rsbuild-plugin/LICENSE',
          dest: 'packages/rsbuild-plugin/dist',
        },
      ],
    }),
  );
  rollupConfig.input = {
    index: 'packages/rsbuild-plugin/src/cli/index.ts',
    utils: 'packages/rsbuild-plugin/src/utils/index.ts',
  };
  return rollupConfig;
};
