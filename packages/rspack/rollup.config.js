const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

module.exports = (rollupConfig, _projectOptions) => {
  // Add sourcemap configuration
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach((output) => {
      output.sourcemap = true;
      if (output.format === 'cjs') {
        output.entryFileNames = output.entryFileNames.replace(/\.js$/, '.cjs');
        output.chunkFileNames = output.chunkFileNames.replace(/\.js$/, '.cjs');
      } else if (output.format === 'esm') {
        output.entryFileNames = output.entryFileNames.replace(/\.js$/, '.mjs');
        output.chunkFileNames = output.chunkFileNames.replace(/\.js$/, '.mjs');
      }
    });
  } else if (rollupConfig.output) {
    rollupConfig.output.sourcemap = true;
    if (rollupConfig.output.format === 'cjs') {
      rollupConfig.output.entryFileNames =
        rollupConfig.output.entryFileNames.replace(/\.js$/, '.cjs');
      rollupConfig.output.chunkFileNames =
        rollupConfig.output.chunkFileNames.replace(/\.js$/, '.cjs');
    } else if (rollupConfig.output.format === 'esm') {
      rollupConfig.output.entryFileNames =
        rollupConfig.output.entryFileNames.replace(/\.js$/, '.mjs');
      rollupConfig.output.chunkFileNames =
        rollupConfig.output.chunkFileNames.replace(/\.js$/, '.mjs');
    }
  }

  rollupConfig.plugins.push(
    replace({
      __VERSION__: JSON.stringify(pkg.version),
    }),
  );

  return rollupConfig;
};
