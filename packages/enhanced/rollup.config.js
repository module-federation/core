const internals = require('@nx/rollup/src/executors/rollup/lib/update-package-json');
const path = require('path');

internals.getExports = function getExports(options) {
  const mainFile = options.outputFileName
    ? options.outputFileName.replace(/\.[tj]s$/, '')
    : path.basename(options.main).replace(/\.[tj]s$/, '');

  const exports = {
    '.': './' + mainFile + options.fileExt,
  };
  if (options.additionalEntryPoints) {
    for (const file of options.additionalEntryPoints) {
      const relativePathFromRoot = path
        .relative(options.entryRoot, file)
        .replace(/\.[tj]s$/, '');

      exports['./' + relativePathFromRoot] =
        './' + relativePathFromRoot + options.fileExt;
    }
  }
  return exports;
};
const alias = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  // const glob = require('glob');fee
  // const files = glob.sync('packages/enhanced/src/**/*.ts');
  // rollupConfig.input = Object.entries(rollupConfig.input).reduce((acc, [key, file]) => {
  //     const split = file.split('packages/enhanced/src/');
  //     const newKey = split[1] ? split[1].replace('.ts', '') : key;
  //     acc[newKey] = path.resolve(file);
  //     return acc;
  // }, {});
  // if (rollupConfig.output.format === 'cjs') {
  //   rollupConfig.output.entryFileNames = rollupConfig.output.entryFileNames.replace('.cjs.js', '.js')
  //   rollupConfig.output.chunkFileNames = rollupConfig.output.chunkFileNames.replace('.cjs.js', '.js')
  // } else {
  //   rollupConfig.output.entryFileNames = rollupConfig.output.entryFileNames.replace('.esm.js', '.mjs')
  //   rollupConfig.output.chunkFileNames = rollupConfig.output.chunkFileNames.replace('.esm.js', '.mjs')
  // }

  console.log(rollupConfig.plugins);
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
