const path = require('path');
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');
const semver = require('semver');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.input = {
    index: 'packages/runtime/src/index.ts',
    type: 'packages/runtime/src/type/index.ts',
    helpers: 'packages/runtime/src/helpers.ts',
  };

  rollupConfig.external = [rollupConfig.external, /node_modules/];

  const project = projectOptions.project;
  const pkg = require(project);
  const RELEASE_NUMBER = Number(
    `${semver.major(pkg.version)}${semver.minor(pkg.version)}${semver.patch(
      pkg.version,
    )}`,
  );

  if (Number.isNaN(RELEASE_NUMBER)) {
    throw new Error(
      `RELEASE_NUMBER is not valid number , please check current pkg.version is valid.`,
    );
  }
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
      __RELEASE_NUMBER__: JSON.stringify(RELEASE_NUMBER),
    }),
    copy({
      targets: [
        { src: 'packages/runtime/LICENSE', dest: 'dist/packages/runtime' },
      ],
    }),
  );

  return rollupConfig;
};
