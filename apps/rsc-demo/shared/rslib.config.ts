import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { createRequire } from 'module';
import path from 'path';

const shared = {
  bundle: false,
  outBase: 'src',
} as const;

const nodeRequire = createRequire(import.meta.url);
const preserveDirectiveLoader = nodeRequire.resolve(
  '@module-federation/rsc/webpack/preserveRscDirectivesLoader',
);
const PreserveRscDirectivesPlugin = nodeRequire(
  '@module-federation/rsc/webpack/PreserveRscDirectivesPlugin',
);
const sourceRoot = path.resolve(__dirname, 'src');

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      syntax: 'es2021',
      dts: {
        distPath: './dist',
      },
    },
    {
      ...shared,
      format: 'cjs',
      syntax: 'es2021',
      dts: false,
    },
  ],
  source: {
    entry: {
      index: ['./src/**/*.{js,jsx}', '!./src/**/*.test.*'],
    },
    tsconfigPath: './tsconfig.json',
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
      },
    }),
  ],
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [
      /@rsc-demo\//,
      /react/,
      'react-server-dom-webpack',
      'server-only',
    ],
  },
  tools: {
    rspack: (config: any) => {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.[jt]sx?$/,
        include: [sourceRoot],
        enforce: 'pre',
        use: [preserveDirectiveLoader],
      });
      config.plugins = config.plugins || [];
      config.plugins.push(new PreserveRscDirectivesPlugin({ sourceRoot }));
      return config;
    },
  },
});
