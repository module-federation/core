import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig(
  [
    {
      name: 'sdk-build',
      entry: { index: 'src/index.ts' },
      clean: true,
    },
    {
      // Keep Node-only resolution code out of the browser SDK's shared chunks.
      name: 'sdk-webpack-path-build',
      entry: { 'normalize-webpack-path': 'src/normalize-webpack-path.ts' },
      clean: false,
    },
  ].map(({ name, entry, clean }) => ({
    ...createDualFormatConfig({
      name,
      packageDir,
      entry,
      external: ['@module-federation/*', 'isomorphic-rslog', 'webpack'],
      define: {},
      copyLicense: true,
      unbundle: true,
    }),
    clean,
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
  })),
);
