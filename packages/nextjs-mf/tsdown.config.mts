import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'nextjs-mf-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        server: 'src/server.ts',
        'asset-adapter-loader': 'src/asset-adapter-loader.ts',
        'runtime-plugin': 'src/runtime-plugin.ts',
      },
      external: ['@module-federation/*', 'next', 'react', 'react-dom'],
      dts: {
        resolver: 'tsc',
        eager: true,
      },
      copyLicense: true,
      unbundle: false,
      format: ['cjs'],
    }),
  },
]);
