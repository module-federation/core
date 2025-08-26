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

  // Add sourcemap configuration
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach((output) => {
      output.sourcemap = true;
    });
  } else if (rollupConfig.output) {
    rollupConfig.output.sourcemap = true;
  }

  return rollupConfig;
};
