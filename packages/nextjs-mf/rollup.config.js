const path = require('path');
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  const project = projectOptions.project;
  const pkg = require(project);

  rollupConfig.plugins.push(
    alias({
      entries: [
        {
          find: '@module-federation/sdk',
          replacement: path.resolve(__dirname, '../../dist/packages/sdk'),
        },
        {
          find: '@module-federation/enhanced',
          replacement: path.resolve(__dirname, '../../dist/packages/enhanced'),
        },
        {
          find: '@module-federation/runtime',
          replacement: path.resolve(__dirname, '../../dist/packages/runtime'),
        },
      ],
    }),
    replace({
      __VERSION__: `'${pkg.version}'`,
      FEDERATION_DEBUG: `'${FEDERATION_DEBUG}'`,
    }),
  );

  return rollupConfig;
};
