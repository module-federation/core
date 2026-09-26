import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPublint } from 'rsbuild-plugin-publint';

const sharedLibOptions = {
  bundle: false,
  externalHelpers: true,
  outBase: 'src',
} as const;

// The CLI entry points use `require.resolve` to locate runtime plugins and the
// federation runtime. Native ESM has no `require`, so inject a
// `createRequire(import.meta.url)` shim into the modules that reference it.
const esmShims = {
  esm: {
    require: true,
  },
} as const;

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.spec.*'],
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
      },
    }),
    pluginPublint(),
  ],
  lib: [
    {
      ...sharedLibOptions,
      format: 'cjs',
      syntax: 'es2019',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('false'),
      },
      dts: false,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      ...sharedLibOptions,
      format: 'esm',
      syntax: 'es5',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
      shims: esmShims,
      dts: false,
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...sharedLibOptions,
      format: 'esm',
      syntax: 'es2019',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
      shims: esmShims,
      dts: {
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/esm-node',
        },
      },
    },
  ],
  tools: {
    rspack(config) {
      if (config.module?.parser?.javascript) {
        const {
          typeReexportsPresence,
          inlineConst,
          exportsPresence,
          ...others
        } = config.module.parser.javascript;
        config.module.parser.javascript = others;
      }
    },
  },
});
