import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import path from 'path';
import renameNodeModules from 'rollup-plugin-rename-node-modules';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: [
      './src/client/MFClient.ts',
      './src/client/useMFClient.ts',
      './src/client/useMFRemote.ts',
    ],
    output: {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      exports: 'auto',
      sourcemap: !production,
      preserveModulesRoot: 'src',
    },
    treeshake: false,
    external: [
      'next/router',
      'next/dist/client/router',
      'react',
      'eventemitter3',
    ],
    plugins: [
      typescript({
        outDir: 'lib',
        sourceMap: !production,
        inlineSources: !production,
      }),
      commonjs(),
      globals({
        dirname: false,
        filename: false,
        process: false,
        global: false,
      }),
      renameNodeModules('dependencies'),
    ],
  },
  {
    input: [
      './src/NextFederationPlugin.js',
      './src/utils.js',
      './src/internal.js',
      './src/build-utils.js',
      './src/loaders/fixImageLoader.js',
      './node-plugin/streaming/index.js',
    ],
    output: {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      exports: 'named',
      preserveModulesRoot: 'src',
    },
    treeshake: false,
    external: [
      'fs',
      'path',
      'crypto',
      'next',
      'fast-glob',
      'webpack-sources',
      /!webpack\/lib\/Template/,
    ], // tells Rollup 'I know what I'm doing here'
    plugins: [
      renameNodeModules('dependencies'),
      nodeResolve({ preferBuiltins: true }), // or `true`
      commonjs(),
      globals({
        dirname: false,
        filename: false,
        process: false,
        fs: false,
        global: false,
      }),
      builtins(),
    ],
  },
];
