import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'enhanced-build',
    cwd: import.meta.dirname,
    entry: {
      index: 'src/index.ts',
      webpack: 'src/webpack.ts',
      rspack: 'src/rspack.ts',
      runtime: 'src/runtime.ts',
      prefetch: 'src/prefetch.ts',
    },
    tsconfig: 'tsconfig.lib.json',
    outDir: 'dist/src',
    format: ['cjs'],
    external: [/^[^./]/, /package\.json$/],
    sourcemap: true,
    clean: true,
    cjsDefault: false,
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
