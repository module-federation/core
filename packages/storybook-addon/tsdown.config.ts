import { defineConfig } from 'tsdown';

const commonConfig = {
  cwd: import.meta.dirname,
  tsconfig: 'tsconfig.lib.json',
  format: ['esm'],
  external: [/^[^./]/],
  sourcemap: true,
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
};

export default defineConfig([
  {
    ...commonConfig,
    name: 'storybook-addon-build',
    entry: {
      index: 'src/index.ts',
    },
    outDir: 'dist/src',
    clean: true,
    dts: {
      resolver: 'tsc',
    },
    inlineOnly: false,
    skipNodeModulesBundle: true,
    unbundle: true,
  },
  {
    ...commonConfig,
    name: 'storybook-addon-preset-build',
    entry: {
      preset: 'preset.ts',
    },
    outDir: 'dist',
    clean: false,
    dts: {
      resolver: 'tsc',
    },
    inlineOnly: false,
    skipNodeModulesBundle: true,
  },
]);
