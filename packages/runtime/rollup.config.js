const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');
const semver = require('semver');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.input = {
    index: 'packages/runtime/src/index.ts',
    types: 'packages/runtime/src/types.ts',
    helpers: 'packages/runtime/src/helpers.ts',
  };

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
  if (rollupConfig.output.format === 'esm' && FEDERATION_DEBUG) {
    rollupConfig.output.format = 'iife';
    rollupConfig.output.inlineDynamicImports = true;
    delete rollupConfig.external;
    delete rollupConfig.input.type;
    delete rollupConfig.input.helpers;
  }

  rollupConfig.plugins.push(
    // alias({
    //   entries: [
    //     {
    //       find: '@module-federation/sdk',
    //       replacement: path.resolve(__dirname, '../../dist/packages/sdk'),
    //     },
    //   ],
    // }),
    replace({
      preventAssignment: true,
      __VERSION__: `'${pkg.version}'`,
      FEDERATION_DEBUG: `'${FEDERATION_DEBUG}'`,
      __RELEASE_NUMBER__: RELEASE_NUMBER,
    }),
    copy({
      targets: [
        { src: 'packages/runtime/LICENSE', dest: 'packages/runtime/dist' },
      ],
    }),
  );

  return rollupConfig;
};
