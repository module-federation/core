import { defineConfig } from '@rslib/core';

const externalizeMetroImports = (request: string) => {
  return /^metro/.test(request) ? 'node-commonjs ' + request : undefined;
};

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      dts: {
        bundle: false,
      },
      output: {
        externals: ({ request }, callback) =>
          callback(undefined, externalizeMetroImports(request!)),
      },
      shims: {
        esm: {
          __dirname: true,
          __filename: true,
          require: true,
        },
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
    },
  ],
  source: {
    entry: {
      index: 'src/!(babel|modules|runtime)',
    },
    tsconfigPath: './tsconfig.build.json',
  },
  output: {
    copy: [
      { from: './src/babel', to: 'babel' },
      { from: './src/modules', to: 'modules' },
      { from: './src/runtime', to: 'runtime' },
    ],
  },
});
