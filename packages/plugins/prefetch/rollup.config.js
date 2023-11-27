const path = require('path');
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.input = {
    index: 'packages/plugins/prefetch/src/index.ts',
    react: 'packages/plugins/prefetch/src/react/index.ts',
    webpack: 'packages/plugins/prefetch/src/webpack/index.ts',
    universal: 'packages/plugins/prefetch/src/universal/index.ts',
  };

  const project = projectOptions.project;
  const pkg = require(project);

  rollupConfig.plugins.push(
    alias({
      entries: [
        {
          find: '@module-federation/sdk',
          replacement: path.resolve(__dirname, '../../../dist/packages/sdk'),
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
