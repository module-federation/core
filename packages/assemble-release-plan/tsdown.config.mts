import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'assemble-release-plan-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
      },
      external: [/^[^./]/],
      dts: {
        resolver: 'tsc',
      },
      unbundle: true,
    }),
  },
]);
