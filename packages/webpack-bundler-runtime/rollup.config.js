const copy = require('rollup-plugin-copy');

function manualChunks(id, projectOptions) {
  if (id.includes(projectOptions.main)) {
    return;
  }
  if (
    projectOptions.additionalEntryPoints.some((entryPoint) => {
      return id.includes(entryPoint);
    })
  ) {
    return;
  }
  if (id.includes('@swc/helpers')) {
    return 'polyfills';
  }
  if (!id.includes('webpack-bundler-runtime')) {
    return;
  }
  if (id.endsWith('types.ts')) {
    return;
  }
  if (id.endsWith('.d.ts')) return;
  const cName = id.split('src/')[1].replace('/', '_').replace('.ts', '');
  return cName;
}

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.external = [/@module-federation/];

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      manualChunks: (id) => manualChunks(id, projectOptions),
      hoistTransitiveImports: false,
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      manualChunks: (id) => manualChunks(id, projectOptions),
      hoistTransitiveImports: false,
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
