const copy = require('rollup-plugin-copy');
const path = require('path');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/rsbuild-plugin/LICENSE',
          dest: 'packages/rsbuild-plugin/dist',
        },
      ],
    }),
  );

  // Set external dependencies explicitly like other packages
  rollupConfig.external = [/@module-federation/, '@rsbuild/core'];

  rollupConfig.input = {
    index: path.resolve(
      process.cwd(),
      './packages/rsbuild-plugin/src/cli/index.ts',
    ),
    utils: path.resolve(
      process.cwd(),
      './packages/rsbuild-plugin/src/utils/index.ts',
    ),
    constant: path.resolve(
      process.cwd(),
      './packages/rsbuild-plugin/src/constant.ts',
    ),
  };

  rollupConfig.output.forEach((output) => {
    output.entryFileNames = `[name].${output.format === 'esm' ? 'esm' : 'cjs'}.${
      output.format === 'esm' ? 'mjs' : 'js'
    }`;
  });

  // rollupConfig
  return rollupConfig;
};
