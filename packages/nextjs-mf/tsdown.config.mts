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
        'src/index': 'src/index.ts',
        node: 'node.ts',
        'src/core/features/pages-map-loader':
          'src/core/features/pages-map-loader.ts',
        'src/core/loaders/fixNextImageLoader':
          'src/core/loaders/fixNextImageLoader.ts',
        'src/core/loaders/fixUrlLoader': 'src/core/loaders/fixUrlLoader.ts',
        'src/core/runtimePlugin': 'src/core/runtimePlugin.ts',
      },
      external: [
        '@module-federation/*',
        'next',
        'react',
        'react-dom',
        'webpack',
      ],
      dts: {
        resolver: 'tsc',
        eager: true,
      },
      copyLicense: true,
      unbundle: true,
      define: {},
      preferNonModuleCjs: false,
    }),
    format: {
      esm: {
        define: {
          'process.env.IS_ESM_BUILD': JSON.stringify('true'),
        },
      },
      cjs: {
        define: {
          'process.env.IS_ESM_BUILD': JSON.stringify('false'),
        },
      },
    },
  },
]);
