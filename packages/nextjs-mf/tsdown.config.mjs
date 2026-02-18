import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  createDualFormatConfig({
    name: 'nextjs-mf-build',
    packageDir,
    entry: {
      'src/index': 'src/index.ts',
      'src/federation-noop': 'src/federation-noop.ts',
      'src/loaders/fixImageLoader': 'src/loaders/fixImageLoader.ts',
      'src/loaders/nextPageMapLoader': 'src/loaders/nextPageMapLoader.ts',
      'src/loaders/fixUrlLoader': 'src/loaders/fixUrlLoader.ts',
      'src/plugins/container/runtimePlugin':
        'src/plugins/container/runtimePlugin.ts',
      'utils/index': 'utils/index.ts',
    },
    external: ['@module-federation/*', 'next', 'react', 'react-dom', 'webpack'],
    dts: {
      resolver: 'tsc',
    },
    copyLicense: true,
    unbundle: true,
    format: ['cjs'],
    preferNonModuleCjs: false,
  }),
]);
