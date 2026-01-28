import { defineConfig } from '@rslib/core';

const pkg = require('./package.json');

export default defineConfig({
  source: {
    entry: {
      "index": "./src/index.ts",
      "constant": "./src/constant.ts"
    },
    tsconfigPath: "./tsconfig.lib.json",
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: ["@module-federation/runtime", "@module-federation/sdk"],
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
