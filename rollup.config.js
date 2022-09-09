import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: ['./src/NextFederationPlugin.js'],
    output: {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      exports: 'auto',
    },
    external: [
      'fs',
      'path',
      'webpack',
      'crypto',
      'next',
      /node_modules/,
      /loaders/,
    ], // tells Rollup 'I know what I'm doing here'
    plugins: [
      nodeResolve({ preferBuiltins: true }), // or `true`
      commonjs(),
      globals({
        dirname: false,
        filename: false,
      }),
      builtins(),
    ],
  },
  {
    input: ['./src/runtime-mf-loader/MFLoader.ts'],
    output: {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      exports: 'auto',
      sourcemap: !production,
    },
    external: ['next/router'],
    plugins: [
      typescript({
        outDir: 'lib',
        sourceMap: !production,
        inlineSources: !production,
      }),
      commonjs(),
    ],
  },
];
