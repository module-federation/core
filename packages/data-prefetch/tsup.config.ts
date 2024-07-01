import { replace } from 'esbuild-plugin-replace';
import minimist from 'minimist';
import type { Options } from 'tsup';

import pkg from './package.json';

const args = minimist(process.argv.slice(2));
const watch = process.env.WATCH;
const sourceMap = args.sourcemap || args.s;

export const tsup: Options = {
  entry: [
    'src/index.ts',
    'src/react/index.ts',
    'src/cli/index.ts',
    'src/cli/babel.ts',
    'src/universal/index.ts',
    'src/plugin.ts',
    'src/shared/index.ts',
  ],
  sourcemap: sourceMap,
  clean: true,
  dts: true,
  watch: watch ? 'src/' : false,
  format: ['esm', 'cjs'],
  legacyOutput: true,
  esbuildPlugins: [
    replace({
      __VERSION__: `'${pkg.version}'`,
      __DEV__:
        '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? (process.env.NODE_ENV !== "production") : false)',
      __TEST__: 'false',
    }),
  ],
};
