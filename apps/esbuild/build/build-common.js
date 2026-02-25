//@ts-nocheck

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const { moduleFederationPlugin } = require('@module-federation/esbuild/plugin');

async function buildProject(projectName, watch) {
  const tsConfig = 'tsconfig.json';
  const outputPath = path.join('dist', projectName);

  fs.rmSync(outputPath, { force: true, recursive: true });

  await esbuild.build({
    entryPoints: [path.join(projectName, 'main.ts')],
    outdir: outputPath,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    mainFields: ['es2020', 'browser', 'module', 'main'],
    conditions: ['es2022', 'es2015', 'module'],
    resolveExtensions: ['.ts', '.tsx', '.mjs', '.js'],
    loader: { '.ts': 'ts' },
    tsconfig: tsConfig,
    splitting: true,
    plugins: [
      moduleFederationPlugin(
        require(path.join('../', projectName, 'federation.config.js')),
      ),
    ],
    watch,
  });

  ['index.html', 'favicon.ico', 'styles.css'].forEach((file) => {
    fs.copyFileSync(path.join(projectName, file), path.join(outputPath, file));
  });
}

module.exports = { buildProject };
