import { defineConfig } from '@rslib/core';

const pkg = require('./package.json');

export default defineConfig({
  source: {
    entry: {
      "index": "./src/index.ts",
      "types": "./src/types.ts"
    },
    tsconfigPath: "./tsconfig.lib.json",
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(process.env.FEDERATION_DEBUG || '')
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [/^@module-federation\//],
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
