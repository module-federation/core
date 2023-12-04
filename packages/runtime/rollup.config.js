const path = require('path');
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.input = {
    index: 'packages/runtime/src/index.ts',
    type: 'packages/runtime/src/type/index.ts',
    helpers: 'packages/runtime/src/helpers.ts',
  };

  const project = projectOptions.project;
  const pkg = require(project);

  rollupConfig.plugins.push(
    alias({
      entries: [
        {
          find: '@module-federation/sdk',
          replacement: path.resolve(__dirname, '../../dist/packages/sdk'),
        },
      ],
    }),
    replace({
      __VERSION__: `'${pkg.version}'`,
      FEDERATION_DEBUG: `'${FEDERATION_DEBUG}'`,
    }),
    copy({
      targets: [
        { src: 'packages/runtime/LICENSE', dest: 'dist/packages/runtime' },
      ],
    }),
  );

  return rollupConfig;
};
