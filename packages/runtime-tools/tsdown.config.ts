import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  createDualFormatConfig({
    name: 'runtime-tools-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
      runtime: 'src/runtime.ts',
      'runtime-core': 'src/runtime-core.ts',
      'webpack-bundler-runtime': 'src/webpack-bundler-runtime.ts',
    },
    external: ['@module-federation/*'],
    dts: {
      resolver: 'tsc',
    },
    copyLicense: true,
    unbundle: false,
  }),
]);
