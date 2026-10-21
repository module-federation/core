import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'ai-proxy-remotes-runtime-plugin-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        core: 'src/core.ts',
        console: 'src/console/index.ts',
      },
      external: ['@module-federation/*'],
      dts: {
        resolver: 'tsc',
      },
      copyLicense: true,
      unbundle: true,
    }),
    sourcemap: false,
    minify: true,
  },
]);
