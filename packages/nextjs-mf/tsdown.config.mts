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
        'src/logger': 'src/logger.ts',
        'src/internal': 'src/internal.ts',
        'src/federation-noop': 'src/federation-noop.ts',
        'src/loaders/fixImageLoader': 'src/loaders/fixImageLoader.ts',
        'src/loaders/helpers': 'src/loaders/helpers.ts',
        'src/loaders/nextPageMapLoader': 'src/loaders/nextPageMapLoader.ts',
        'src/loaders/fixUrlLoader': 'src/loaders/fixUrlLoader.ts',
        'src/plugins/CopyFederationPlugin':
          'src/plugins/CopyFederationPlugin.ts',
        'src/plugins/NextFederationPlugin/index':
          'src/plugins/NextFederationPlugin/index.ts',
        'src/plugins/NextFederationPlugin/apply-client-plugins':
          'src/plugins/NextFederationPlugin/apply-client-plugins.ts',
        'src/plugins/NextFederationPlugin/apply-server-plugins':
          'src/plugins/NextFederationPlugin/apply-server-plugins.ts',
        'src/plugins/NextFederationPlugin/set-options':
          'src/plugins/NextFederationPlugin/set-options.ts',
        'src/plugins/NextFederationPlugin/validate-options':
          'src/plugins/NextFederationPlugin/validate-options.ts',
        'src/plugins/NextFederationPlugin/next-fragments':
          'src/plugins/NextFederationPlugin/next-fragments.ts',
        'src/plugins/NextFederationPlugin/regex-equal':
          'src/plugins/NextFederationPlugin/regex-equal.ts',
        'src/plugins/NextFederationPlugin/webpack-sources-shim':
          'src/plugins/NextFederationPlugin/webpack-sources-shim.ts',
        'src/plugins/container/InvertedContainerPlugin':
          'src/plugins/container/InvertedContainerPlugin.ts',
        'src/plugins/container/InvertedContainerRuntimeModule':
          'src/plugins/container/InvertedContainerRuntimeModule.ts',
        'src/plugins/container/runtimePlugin':
          'src/plugins/container/runtimePlugin.ts',
        'utils/index': 'utils/index.ts',
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
