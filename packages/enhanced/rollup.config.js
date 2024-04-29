const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  // rollupConfig.input = {
  //   index: 'packages/runtime/src/index.ts',
  //   types: 'packages/runtime/src/types.ts',
  //   helpers: 'packages/runtime/src/helpers.ts',
  // };

  const project = projectOptions.project;
  const pkg = require(project);

  rollupConfig.output.preserveModules = true;
  if (rollupConfig.output.format === 'esm' && FEDERATION_DEBUG) {
    rollupConfig.output.format = 'iife';
    rollupConfig.output.inlineDynamicImports = true;
    delete rollupConfig.external;
    delete rollupConfig.input.type;
    delete rollupConfig.input.helpers;
  }

  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
    }),
    copy({
      targets: [
        { src: 'packages/enhanced/LICENSE', dest: 'packages/enhanced/dist' },
      ],
    }),
  );

  return rollupConfig;
};
