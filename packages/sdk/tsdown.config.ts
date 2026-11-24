import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
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
      },
      external: [
        '@module-federation/*',
        'isomorphic-rslog',
        'webpack',
        /^node:/,
      ],
      define: {},
      copyLicense: true,
      unbundle: true,
    }),
    // The main SDK entry also runs in browsers. Node targeting can inject
    // createRequire into Rolldown's shared ESM helper, even for browser entries.
    // The Node-only resolver entry imports its builtins explicitly instead.
    platform: 'neutral',
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
