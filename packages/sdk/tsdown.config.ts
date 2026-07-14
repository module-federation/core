import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'sdk-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        'normalize-webpack-path': 'src/normalize-webpack-path.ts',
      },
      external: ['@module-federation/*', 'isomorphic-rslog', 'webpack'],
      define: {},
      outExtensions: undefined,
      copyLicense: true,
      unbundle: true,
    }),
    dts: {
      resolver: 'tsc',
    },
    format: {
      esm: {
        define: { 'process.env.IS_ESM_BUILD': JSON.stringify('true') },
      },
      cjs: {
        define: { 'process.env.IS_ESM_BUILD': JSON.stringify('false') },
      },
    },
  },
]);
