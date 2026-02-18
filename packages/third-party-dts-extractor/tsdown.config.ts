import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  createDualFormatConfig({
    name: 'third-party-dts-extractor-build',
    packageDir,
    entry: {
      index: 'src/index.ts',
    },
    external: ['find-pkg', 'fs-extra', 'resolve'],
    dts: {
      resolver: 'tsc',
    },
    copyLicense: true,
    unbundle: true,
  }),
]);
