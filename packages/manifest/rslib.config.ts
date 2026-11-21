import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig, type RsbuildPlugin } from '@rslib/core';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

export default defineConfig({
  plugins: [pluginLicense(), pluginPublint()],
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
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
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//],
  },
});
