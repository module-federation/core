import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'webpack-bundler-runtime-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        constant: 'src/constant.ts',
        bundler: 'src/bundler.ts',
      },
      external: ['@module-federation/*', 'webpack'],
      noExternal: ['@module-federation/error-codes'],
      dts: {
        resolver: 'tsc',
      },
      copyLicense: true,
      unbundle: true,
    }),
    outputOptions: {
      exports: 'named',
    },
  },
]);
