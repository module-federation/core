const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  // Check if rollupConfig.output is an array
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach((output) => {
      output.sourcemap = true;
      output.hoistTransitiveImports = false;
      if (output.format === 'cjs') {
        output.entryFileNames = '[name].cjs';
        output.chunkFileNames = '[name].cjs';
      } else if (output.format === 'esm') {
        output.entryFileNames = '[name].mjs';
        output.chunkFileNames = '[name].mjs';
      }
    });
  } else if (rollupConfig.output) {
    // If it's not an array, directly set the property
    rollupConfig.output.sourcemap = true;
    rollupConfig.output.hoistTransitiveImports = false;
    if (rollupConfig.output.format === 'cjs') {
      rollupConfig.output.entryFileNames = '[name].cjs';
      rollupConfig.output.chunkFileNames = '[name].cjs';
    } else if (rollupConfig.output.format === 'esm') {
      rollupConfig.output.entryFileNames = '[name].mjs';
      rollupConfig.output.chunkFileNames = '[name].mjs';
    }
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
