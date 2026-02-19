import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'webpack-bundler-runtime-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        constant: 'src/constant.ts',
      },
      external: ['@module-federation/*', 'webpack'],
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
