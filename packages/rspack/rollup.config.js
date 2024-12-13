const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const path = require('path');

module.exports = (rollupConfig, projectOptions) => {
  const pkg = require('./package.json');

  rollupConfig.input['plugin'] = path.resolve(
    process.cwd(),
    './packages/rspack/src/ModuleFederationPlugin.ts',
  );
  rollupConfig.plugins.push(
    replace({
      __VERSION__: JSON.stringify(pkg.version),
    }),
    copy({
      targets: [
        {
          src: 'packages/rspack/LICENSE',
          dest: 'packages/rspack/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
