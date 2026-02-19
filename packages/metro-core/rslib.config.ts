import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

const externalizeMetroImports = (request: string) => {
  return /^metro/.test(request) ? 'node-commonjs ' + request : undefined;
};

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      dts: {
        autoExtension: true,
        bundle: false,
      },
      output: {
        externals: ({ request }, callback) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      dts: {
        autoExtension: true,
        bundle: false,
      },
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
