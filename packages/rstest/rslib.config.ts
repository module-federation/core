import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: (['esm', 'cjs'] as const).map((format) => ({
    format,
    syntax: 'es2021',
    bundle: true,
    dts: {
      autoExtension: true,
      distPath: './dist',
    },
    redirect: {
      dts: {
        extension: true,
      },
    },
  })),
  source: {
    entry: {
      index: './src/index.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    // Keep workspace packages external; everything else is bundled for portability.
    externals: [/@module-federation\//, 'pnpapi'],
  },
});
