import { defineConfig } from '@rslib/core';

const pkg = require('./package.json');

export default defineConfig({
  source: {
    entry: {
      "index": "./src/index.ts"
    },
    tsconfigPath: "./tsconfig.json",
    define: {
      __VERSION__: JSON.stringify(pkg.version)
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    copy: [{ from: './LICENSE', to: '.' }],
  },
  lib: [
  {
    format: 'cjs',
    syntax: 'es2021',
    bundle: true,
    dts: false,
    output: {
      filename: {
        js: '[name].cjs.js'
      }
    }
  }
  ],
});
