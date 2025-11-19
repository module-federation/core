const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/rspeedy-plugin/LICENSE',
          dest: 'packages/rspeedy-plugin/dist',
        },
      ],
    }),
  );

  rollupConfig.input = {
    index: 'packages/rspeedy-plugin/src/index.ts',
  };

  rollupConfig.output.forEach((output) => {
    output.sourcemap = true;
    output.entryFileNames = `[name].${output.format === 'esm' ? 'esm' : 'cjs'}.${
      output.format === 'esm' ? 'mjs' : 'js'
    }`;
  });

  return rollupConfig;
};
