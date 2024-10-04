const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.external = [/@module-federation/];
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      manualChunks: (id) => {
        debugger;
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      manualChunks: (id) => {
        debugger;
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
    };
  }

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
