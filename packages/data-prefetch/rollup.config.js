const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');
const pkg = require('./package.json');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.input = {
    index: 'packages/data-prefetch/src/index.ts',
    react: 'packages/data-prefetch/src/react/index.ts',
    cli: 'packages/data-prefetch/src/cli/index.ts',
    'babel-plugin': 'packages/data-prefetch/src/cli/babel.ts',
    universal: 'packages/data-prefetch/src/universal/index.ts',
    plugin: 'packages/data-prefetch/src/plugin.ts',
    shared: 'packages/data-prefetch/src/shared/index.ts',
  };
  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      values: {
        __VERSION__: `'${pkg.version}'`,
        __DEV__:
          '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
        __TEST__: 'false',
      },
    }),
    copy({
      targets: [
        {
          src: 'packages/data-prefetch/LICENSE',
          dest: 'packages/data-prefetch/dist',
        },
      ],
    }),
  );

  rollupConfig.external = [/@module-federation/];
  rollupConfig.output = {
    ...rollupConfig.output,
    manualChunks: (id) => {
      if (id.includes('@swc/helpers')) {
        return 'polyfills';
      }
    },
  };

  return rollupConfig;
};
