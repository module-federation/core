const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  // Add sourcemap configuration
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach((output) => {
      output.sourcemap = true;
    });
  } else if (rollupConfig.output) {
    rollupConfig.output.sourcemap = true;
  }

  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'dist/packages/sdk' }],
    }),
  );

  return rollupConfig;
};
