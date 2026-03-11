import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'core-build',
    cwd: import.meta.dirname,
    entry: {
      index: 'src/index.ts',
    },
    tsconfig: 'tsconfig.lib.json',
    outDir: 'dist/src',
    format: ['cjs'],
    external: [/^[^./]/],
    sourcemap: true,
    clean: true,
    dts: {
      resolver: 'tsc',
    },
    inlineOnly: false,
    skipNodeModulesBundle: true,
    unbundle: true,
    outExtensions: () => ({
      js: '.js',
      dts: '.d.ts',
    }),
  },
]);
