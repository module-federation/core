const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const path = require('path');

module.exports = (rollupConfig, projectOptions) => {
  const pkg = require('./package.json');

  rollupConfig.input['plugin'] = path.resolve(
    process.cwd(),
    './packages/rspack/src/ModuleFederationPlugin.ts',
  );

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      hoistTransitiveImports: false,
      entryFileNames:
        c.format === 'esm'
          ? c.entryFileNames.replace('.js', '.mjs')
          : c.entryFileNames,
      chunkFileNames:
        c.format === 'esm'
          ? c.chunkFileNames.replace('.js', '.mjs')
          : c.chunkFileNames,
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      hoistTransitiveImports: false,
      entryFileNames:
        rollupConfig.output.format === 'esm'
          ? rollupConfig.output.entryFileNames.replace('.js', '.mjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'esm'
          ? rollupConfig.output.chunkFileNames.replace('.js', '.mjs')
          : rollupConfig.output.chunkFileNames,
    };
  }

  rollupConfig.plugins.push(
    replace({
      __VERSION__: JSON.stringify(pkg.version),
    }),
    copy({
      targets: [
        {
          src: 'packages/rspack/LICENSE',
          dest: 'packages/rspack/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
