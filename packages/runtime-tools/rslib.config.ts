import { defineConfig } from '@rslib/core';

const pkg = require('./package.json');

export default defineConfig({
  source: {
    entry: {
      "index": "./src/index.ts",
      "runtime": "./src/runtime.ts",
      "webpack-bundler-runtime": "./src/webpack-bundler-runtime.ts",
      "runtime-core": "./src/runtime-core.ts"
    },
    tsconfigPath: "./tsconfig.lib.json",
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [/^@module-federation\//],
  },
  lib: [
  {
    format: 'cjs',
    syntax: 'es2021',
    bundle: true,
    dts: false,
    output: {
      filename: {
        js: '[name].cjs.cjs'
      }
    }
  },
  {
    format: 'esm',
    syntax: 'es2021',
    bundle: true,
    dts: { distPath: './dist' },
    output: {
      filename: {
        js: '[name].esm.js'
      }
    }
  }
  ],
});
