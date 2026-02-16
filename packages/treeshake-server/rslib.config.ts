import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      autoExtension: true,
      syntax: 'es2021',
      bundle: true,
      dts: {
        autoExtension: true,
        distPath: './dist',
      },
    },
    {
      format: 'cjs',
      autoExtension: true,
      syntax: 'es2021',
      bundle: true,
      dts: {
        autoExtension: true,
        distPath: './dist',
      },
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      server: './src/server.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//, 'pnpapi'],
    copy: [
      {
        from: './template',
        to: './template',
      },
    ],
  },
});
