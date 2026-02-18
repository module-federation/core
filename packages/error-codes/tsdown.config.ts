import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  createDualFormatConfig({
    name: 'error-codes-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
    },
    dts: {
      resolver: 'tsc',
    },
    unbundle: false,
  }),
]);
