import { defineConfig } from '@rslib/core';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
);

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: {
        distPath: './dist/src',
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      dts: false,
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      webpack: './src/webpack.ts',
      rspack: './src/rspack.ts',
      runtime: './src/runtime.ts',
      prefetch: './src/prefetch.ts',
    },
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist/src',
    },
    externals: [
      // Add other externals if needed
    ],
  },
});
