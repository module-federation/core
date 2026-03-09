import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'rslib-plugin-build',
    cwd: import.meta.dirname,
    entry: {
      index: 'src/index.ts',
      'executors/build/executor': 'src/executors/build/executor.ts',
      'executors/dev/executor': 'src/executors/dev/executor.ts',
      'executors/echo/executor': 'src/executors/echo/executor.ts',
    },
    tsconfig: 'tsconfig.json',
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
