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
        compose: 'src/compose.ts',
        'adapters/remotes': 'src/adapters/remotes.ts',
        'adapters/consumes': 'src/adapters/consumes.ts',
        'adapters/share-scope': 'src/adapters/share-scope.ts',
        'adapters/container': 'src/adapters/container.ts',
      },
      external: ['@module-federation/*', 'webpack'],
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
