import { defineConfig } from 'tsdown';

import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/config-helpers.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'lynx-build',
      packageDir,
      entry: {
        index: 'src/index.ts',
        plugin: 'src/plugin.ts',
        runtimePlugin: 'src/runtimePlugin.ts',
      },
      external: [
        '@lynx-js/*',
        '@module-federation/*',
        '@rspack/core',
        '@rsbuild/core',
      ],
      unbundle: true,
      preferNonModuleCjs: false,
    }),
    inlineOnly: false,
    dts: {
      resolver: 'tsc',
    },
    outputOptions: {
      exports: 'named',
    },
  },
]);
