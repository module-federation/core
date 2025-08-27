const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    replace({
      __VERSION__: JSON.stringify(pkg.version),
    }),
    copy({
      targets: [
        {
          src: 'packages/cli/LICENSE',
          dest: 'packages/cli/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
