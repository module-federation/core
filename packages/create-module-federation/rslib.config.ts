import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';
import pkg from './package.json';

export default defineConfig({
  lib: [{ format: 'esm', autoExtension: true }],
  plugins: [pluginPublint()],
  source: {
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
  },
});
