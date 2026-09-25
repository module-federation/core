import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  externalWithSelectors,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'sdk-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        'normalize-webpack-path': 'src/normalize-webpack-path.ts',
        'selectors/env/legacy': 'src/selectors/env/legacy.ts',
        'selectors/env/web': 'src/selectors/env/web.ts',
        'selectors/env/node': 'src/selectors/env/node.ts',
        'selectors/env/worker': 'src/selectors/env/worker.ts',
        'selectors/env/universal': 'src/selectors/env/universal.ts',
        'selectors/platform-loader/legacy':
          'src/selectors/platform-loader/legacy.ts',
        'selectors/platform-loader/web': 'src/selectors/platform-loader/web.ts',
        'selectors/platform-loader/node':
          'src/selectors/platform-loader/node.ts',
        'selectors/platform-loader/worker':
          'src/selectors/platform-loader/worker.ts',
        'selectors/platform-loader/universal':
          'src/selectors/platform-loader/universal.ts',
      },
      external: externalWithSelectors([
        '@module-federation/*',
        'isomorphic-rslog',
        'webpack',
      ]),
      define: {},
      copyLicense: true,
      unbundle: true,
    }),
    dts: {
      resolver: 'tsc',
    },
    format: {
      esm: {
        define: { 'process.env.IS_ESM_BUILD': JSON.stringify('true') },
      },
      cjs: {
        define: { 'process.env.IS_ESM_BUILD': JSON.stringify('false') },
      },
    },
  },
]);
