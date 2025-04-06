const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');

module.exports = (rollupConfig, projectOptions) => {
  // Adjust external dependencies if necessary for a Rollup plugin
  rollupConfig.external = [
    'rollup',
    'typescript',
    'fs',
    'path',
    'glob',
    /@babel\/.*/,
  ];

  // Configure output formats suitable for a Rollup plugin
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      sourcemap: true,
      entryFileNames: `[name].${c.format === 'esm' ? 'mjs' : 'js'}`,
      chunkFileNames: `[name]-[hash].${c.format === 'esm' ? 'mjs' : 'js'}`,
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      sourcemap: true,
      entryFileNames: `[name].${rollupConfig.output.format === 'esm' ? 'mjs' : 'js'}`,
      chunkFileNames: `[name]-[hash].${rollupConfig.output.format === 'esm' ? 'mjs' : 'js'}`,
    };
  }

  console.log('ref-optimizer rollup.config.js: Applied custom configuration.');

  return rollupConfig;
};
