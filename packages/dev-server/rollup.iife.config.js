const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');
const semver = require('semver');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.input = {
    'launch-web-client': 'packages/dev-server/src/launchWebClient.ts',
  };
  rollupConfig.output.format = 'iife';

  rollupConfig.output.entryFileNames = '[name].iife.js';
  rollupConfig.output.chunkFileNames = '[name].iife.js';
  const project = projectOptions.project;
  const pkg = require(project);

  // if (rollupConfig.output.format === 'esm' && FEDERATION_DEBUG) {
  //   rollupConfig.output.format = 'iife';
  //   rollupConfig.output.inlineDynamicImports = true;
  //   delete rollupConfig.external;
  //   delete rollupConfig.input.type;
  //   delete rollupConfig.input.helpers;
  // }

  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
    }),
    copy({
      targets: [
        {
          src: 'packages/dev-server/LICENSE',
          dest: 'packages/dev-server/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
