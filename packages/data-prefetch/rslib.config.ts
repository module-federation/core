import { defineConfig } from '@rslib/core';

const pkg = require('./package.json');

export default defineConfig({
  source: {
    entry: {
      "index": "./src/index.ts",
      "react": "./src/react/index.ts",
      "cli": "./src/cli/index.ts",
      "babel": "./src/cli/babel.ts",
      "universal": "./src/universal/index.ts",
      "plugin": "./src/plugin.ts"
    },
    tsconfigPath: "./tsconfig.lib.json",
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
