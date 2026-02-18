import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'sdk-index-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
      },
      external: ['@module-federation/*', 'isomorphic-rslog', 'webpack'],
      dts: {
        resolver: 'tsc',
      },
      copyLicense: true,
      unbundle: false,
    }),
    clean: false,
  },
  {
    ...createDualFormatConfig({
      name: 'sdk-normalize-webpack-path-build',
      packageDir,
      entry: {
        'normalize-webpack-path': 'src/normalize-webpack-path.ts',
      },
      external: ['@module-federation/*', 'isomorphic-rslog', 'webpack'],
      dts: {
        resolver: 'tsc',
      },
      copyLicense: false,
      unbundle: false,
    }),
    clean: false,
  },
]);
