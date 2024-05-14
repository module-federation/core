//@ts-nocheck

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const {
  createEsBuildAdapter,
  moduleFederationPlugin,
} = require('@module-federation/esbuild/esbuild-adapter');
const { federationBuilder } = require('@module-federation/esbuild/build');

async function buildProject(projectName, watch) {
  const tsConfig = 'tsconfig.json';
  const outputPath = `dist/${projectName}`;
  /*
   *  Step 1: Initialize Native Federation
   */

  await federationBuilder.init({
    options: {
      workspaceRoot: path.join(__dirname, '..'),
      outputPath,
      tsConfig,
      federationConfig: `${projectName}/federation.config.js`,
      verbose: false,
      watch,
    },

    /*
     * As this core lib is tooling-agnostic, you
     * need a simple adapter for your bundler.
     * It's just a matter of one function.
     */
    // adapter: createEsBuildAdapter({
    //   plugins: [
    //   ],
    // }),
  });

  /*
   *  Step 2: Trigger your build process
   *
   *      You can use any tool for this. Here, we go with a very
   *      simple esbuild-based build.
   *
   *      Just respect the externals in `federationBuilder.externals`.
   */

  fs.rmSync(outputPath, { force: true, recursive: true });

  // old sidecar build
  // await federationBuilder.build();

  const federationInfo = federationBuilder.federationInfo;
  const federationConfig = federationBuilder.config;

  await esbuild.build({
    entryPoints: [
      `${projectName}/main.ts`,
      path.join(projectName, federationConfig.filename),
    ],
    external: federationBuilder.externals,
    outdir: outputPath,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    mainFields: ['es2020', 'browser', 'module', 'main'],
    conditions: ['es2020', 'es2015', 'module'],
    resolveExtensions: ['.ts', '.tsx', '.mjs', '.js'],
    tsconfig: tsConfig,
    splitting: true,
    plugins: [moduleFederationPlugin(federationBuilder)],
    watch,
  });

  fs.copyFileSync(
    `${projectName}/index.html`,
    `dist/${projectName}/index.html`,
  );
  fs.copyFileSync(
    `${projectName}/favicon.ico`,
    `dist/${projectName}/favicon.ico`,
  );
  fs.copyFileSync(
    `${projectName}/styles.css`,
    `dist/${projectName}/styles.css`,
  );

  /*
   *  Step 3: Let the build method do the additional tasks
   *       for supporting Native Federation
   */

  // await federationBuilder.build();
}

module.exports = { buildProject };
