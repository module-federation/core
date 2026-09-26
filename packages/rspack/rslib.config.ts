import { defineConfig, type RsbuildPlugin } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const pluginLicense = (): RsbuildPlugin => ({
  name: 'module-federation:license',
  setup(api) {
    const licensePath = resolve(api.context.rootPath, 'LICENSE');

    api.processAssets(
      { stage: 'additional' },
      async ({ compilation, sources }) => {
        compilation.fileDependencies.add(licensePath);
        compilation.emitAsset(
          'LICENSE',
          new sources.RawSource(await readFile(licensePath)),
        );
      },
    );
  },
});

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
);

export default defineConfig({
  plugins: [pluginLicense(), pluginPublint()],
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
      dts: {
        bundle: false,
        distPath: './dist',
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('false'),
      },
      dts: false,
    },
  ],
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx,js,jsx}',
        '!./src/**/*.spec.*',
        '!./src/**/*.test.*',
      ],
    },
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//, '@rspack/core'],
  },
});
