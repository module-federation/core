const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/data-prefetch/LICENSE',
          dest: 'packages/data-prefetch/dist',
        },
      ],
    }),
  );
  rollupConfig.input = {
    index: 'packages/data-prefetch/src/index.ts',
    react: 'packages/data-prefetch/src/react/index.ts',
    cli: 'packages/data-prefetch/src/cli/index.ts',
    babel: 'packages/data-prefetch/src/cli/babel.ts',
    universal: 'packages/data-prefetch/src/universal/index.ts',
    plugin: 'packages/data-prefetch/src/plugin.ts',
    shared: 'packages/data-prefetch/src/shared/index.ts',
  };
  rollupConfig.external = [/@module-federation/];
  return rollupConfig;
};
