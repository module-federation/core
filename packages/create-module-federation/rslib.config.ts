import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [{ format: 'esm' }],
  plugins: [pluginPublint()],
});
