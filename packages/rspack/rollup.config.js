const copy = require('rollup-plugin-copy');
const replace = require('@rollup/plugin-replace');
const path = require('path');

module.exports = (rollupConfig, projectOptions) => {
  const pkg = require('./package.json');

  const projectDir = __dirname;
  const resolveProjectPath = (...segments) =>
    path.resolve(projectDir, ...segments);

  // Always resolve inputs relative to the package directory so the build works when invoked from nested CWDs.
  rollupConfig.input['plugin'] = resolveProjectPath(
    'src/ModuleFederationPlugin.ts',
  );
  rollupConfig.input['remote-entry-plugin'] = resolveProjectPath(
    'src/RemoteEntryPlugin.ts',
  );

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      sourcemap: true,
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
      sourcemap: true,
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
          src: resolveProjectPath('LICENSE'),
          dest: resolveProjectPath('dist'),
        },
      ],
    }),
  );

  return rollupConfig;
};
