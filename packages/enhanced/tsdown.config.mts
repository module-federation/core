import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'enhanced-build',
    cwd: import.meta.dirname,
    // Emit the full source tree so lazy runtime requires inside wrapper classes
    // continue to resolve internal modules from dist/src/** like the old tsc build.
    entry: [
      'src/**/*.{ts,tsx,js,mts,cts}',
      '!src/**/*.d.ts',
      '!src/scripts/**',
    ],
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
