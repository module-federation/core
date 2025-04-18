import { defineConfig } from '@rslib/core';
import pkg from './package.json';

export default defineConfig({
  lib: [
    {
      source: {
        define: {
          __VERSION__: JSON.stringify(pkg.version),
        },
        entry: {
          index: './src',
        },
      },
      output: {
        distPath: {
          root: './dist/',
        },
      },
      bundle: false,
      dts: true,
      format: 'cjs',
      syntax: 'es2021',
    },
  ],
  output: {
    copy: {
      patterns: [{ from: 'src/resources', to: 'resources' }],
    },
  },
});
