import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'webpack-bundler-runtime-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        constant: 'src/constant.ts',
        bundler: 'src/bundler.ts',
        'selectors/container-entry/legacy':
          'src/selectors/container-entry/legacy.ts',
        'selectors/container-entry/enabled':
          'src/selectors/container-entry/enabled.ts',
        'selectors/container-entry/disabled':
          'src/selectors/container-entry/disabled.ts',
        'selectors/remotes/legacy': 'src/selectors/remotes/legacy.ts',
        'selectors/remotes/enabled': 'src/selectors/remotes/enabled.ts',
        'selectors/remotes/disabled': 'src/selectors/remotes/disabled.ts',
        'selectors/shared-runtime/legacy':
          'src/selectors/shared-runtime/legacy.ts',
        'selectors/shared-runtime/enabled':
          'src/selectors/shared-runtime/enabled.ts',
        'selectors/shared-runtime/disabled':
          'src/selectors/shared-runtime/disabled.ts',
        'selectors/tree-shaking-share-plugin/legacy':
          'src/selectors/tree-shaking-share-plugin/legacy.ts',
        'selectors/tree-shaking-share-plugin/enabled':
          'src/selectors/tree-shaking-share-plugin/enabled.ts',
        'selectors/tree-shaking-share-plugin/disabled':
          'src/selectors/tree-shaking-share-plugin/disabled.ts',
      },
      external: ['@module-federation/*', 'webpack', /^#mf\//],
      noExternal: ['@module-federation/error-codes'],
      dts: {
        resolver: 'tsc',
      },
      copyLicense: true,
      unbundle: true,
    }),
    outputOptions: {
      exports: 'named',
    },
  },
]);
