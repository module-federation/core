const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  // Check if rollupConfig.output is an array
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach((output) => {
      output.hoistTransitiveImports = false;
    });
  } else if (rollupConfig.output) {
    // If it's not an array, directly set the property
    rollupConfig.output.hoistTransitiveImports = false;
  }

  rollupConfig.plugins.push(
    copy({
      targets: [
        { src: 'packages/manifest/LICENSE', dest: 'packages/manifest/dist' },
      ],
    }),
  );

  return rollupConfig;
};
