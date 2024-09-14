const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'packages/sdk/dist' }],
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
