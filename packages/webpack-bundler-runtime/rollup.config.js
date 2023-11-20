const path = require('path');
const alias = require('@rollup/plugin-alias');

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.plugins.push(
    alias({
      entries: [
        {
          find: '@module-federation/sdk',
          replacement: path.resolve(__dirname, '../../dist/packages/sdk'),
        },
        {
          find: '@module-federation/runtime',
          replacement: path.resolve(__dirname, '../../dist/packages/runtime'),
        },
      ],
    }),
  );

  return rollupConfig;
};
