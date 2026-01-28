const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.input = {
    index: 'packages/rspack/src/index.ts',
    plugin: 'packages/rspack/src/ModuleFederationPlugin.ts',
    'remote-entry-plugin': 'packages/rspack/src/RemoteEntryPlugin.ts',
  };

  // Add sourcemap configuration
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach((output) => {
      output.sourcemap = true;
      if (output.format === 'cjs') {
        output.entryFileNames = '[name].cjs';
        output.chunkFileNames = '[name].cjs';
      } else if (output.format === 'esm') {
        output.entryFileNames = '[name].mjs';
        output.chunkFileNames = '[name].mjs';
      }
    });
  } else if (rollupConfig.output) {
    rollupConfig.output.sourcemap = true;
    if (rollupConfig.output.format === 'cjs') {
      rollupConfig.output.entryFileNames = '[name].cjs';
      rollupConfig.output.chunkFileNames = '[name].cjs';
    } else if (rollupConfig.output.format === 'esm') {
      rollupConfig.output.entryFileNames = '[name].mjs';
      rollupConfig.output.chunkFileNames = '[name].mjs';
    }
  }

  rollupConfig.plugins.push(
    replace({
      __VERSION__: JSON.stringify(pkg.version),
    }),
  );

  return rollupConfig;
};
