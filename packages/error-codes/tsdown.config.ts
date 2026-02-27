import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  createDualFormatConfig({
    name: 'error-codes-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
    },
    external: ['@module-federation/*'],
    dts: {
      resolver: 'tsc',
    },
    unbundle: true,
  }),
]);
