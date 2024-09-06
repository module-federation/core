const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.external = [/@module-federation/];
  rollupConfig.output = {
    ...rollupConfig.output,
    manualChunks: (id) => {
      if (id.includes('@swc/helpers')) {
        return 'polyfills';
      }
    },
  };

  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/webpack-bundler-runtime/LICENSE',
          dest: 'packages/webpack-bundler-runtime/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
