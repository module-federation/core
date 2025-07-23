import { defineConfig } from '@rslib/core';
import * as fs from 'fs';
import * as path from 'path';

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

// Read package.json to get version
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'),
);

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      bundle: true,
      autoExternal: true,
      dts: true,
      output: {
        distPath: {
          root: './dist',
        },
        filename: {
          js: '[name].cjs.cjs',
        },
        sourceMap: false,
      },
    },
    {
      format: 'esm',
      bundle: true,
      autoExternal: true,
      dts: false, // Only generate DTS once
      output: {
        distPath: {
          root: './dist',
        },
        filename: {
          js: '[name].esm.js',
        },
        sourceMap: false,
      },
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      types: './src/types.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  tools: {
    rspack: {
      externals: {
        '@module-federation/sdk': '@module-federation/sdk',
        '@module-federation/error-codes': '@module-federation/error-codes',
      },
      plugins: [
        {
          name: 'replace-version',
          apply: 'build',
          config(config) {
            config.plugins = config.plugins || [];
            config.plugins.push(
              new (require('webpack').DefinePlugin)({
                __VERSION__: JSON.stringify(pkg.version),
                FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
              }),
            );
          },
        },
      ],
    },
  },
});
