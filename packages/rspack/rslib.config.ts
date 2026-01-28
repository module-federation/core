import { defineConfig } from '@rslib/core';

const pkg = require('./package.json');

export default defineConfig({
  source: {
    entry: {
      "index": "./src/index.ts",
      "plugin": "./src/ModuleFederationPlugin.ts",
      "remote-entry-plugin": "./src/RemoteEntryPlugin.ts"
    },
    tsconfigPath: "./tsconfig.lib.json",
    define: {
      __VERSION__: JSON.stringify(pkg.version)
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [/^@module-federation\//, "@rspack/core"],
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
  },
  {
    format: 'esm',
    syntax: 'es2021',
    bundle: true,
    dts: { distPath: './dist' },
    output: {
      filename: {
        js: '[name].esm.mjs'
      }
    }
  }
  ],
});
