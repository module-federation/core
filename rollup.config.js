import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import { obfuscator } from 'rollup-obfuscator';

export default {
  input: ['./src/NextFederationPlugin.js'],
  output: {
    dir: 'lib',
    format: 'cjs',
    preserveModules: false,
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
    // multi(),
    globals({
      dirname: false,
      filename: false,
    }),
    builtins(),
    // obfuscator(),
  ],
};
