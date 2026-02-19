import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'sdk-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        'normalize-webpack-path': 'src/normalize-webpack-path.ts',
        bundler: 'src/bundler.ts',
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
