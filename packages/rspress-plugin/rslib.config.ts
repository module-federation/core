import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  plugins: [pluginPublint()],
  source: {
    entry: {
      index: 'src/plugin.ts',
      runtime: 'src/runtime/index.tsx',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  lib: [
    {
      ...shared,
      format: 'esm',
      autoExternal: true,
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
  ],
});
