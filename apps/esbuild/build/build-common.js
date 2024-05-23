//@ts-nocheck

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const {
  moduleFederationPlugin,
} = require('@module-federation/esbuild/esbuild-adapter');
const { federationBuilder } = require('@module-federation/esbuild/build');

async function buildProject(projectName, watch) {
  const tsConfig = 'tsconfig.json';
  const outputPath = path.join('dist', projectName);

  await federationBuilder.init({
    options: {
      workspaceRoot: path.join(__dirname, '..'),
      outputPath,
      tsConfig,
      federationConfig: path.join(projectName, 'federation.config.js'),
      verbose: false,
      watch,
    },
  });

  fs.rmSync(outputPath, { force: true, recursive: true });

  const federationConfig = federationBuilder.config;

  await esbuild.build({
    entryPoints: [path.join(projectName, 'main.ts')],
    external: federationBuilder.externals,
    outdir: outputPath,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    mainFields: ['es2020', 'browser', 'module', 'main'],
    conditions: ['es2020', 'es2015', 'module'],
    resolveExtensions: ['.ts', '.tsx', '.mjs', '.js'],
    loader: { '.ts': 'ts' },
    tsconfig: tsConfig,
    splitting: true,
    plugins: [moduleFederationPlugin(federationBuilder)],
    watch,
  });

  ['index.html', 'favicon.ico', 'styles.css'].forEach((file) => {
    fs.copyFileSync(path.join(projectName, file), path.join(outputPath, file));
  });
}

module.exports = { buildProject };
