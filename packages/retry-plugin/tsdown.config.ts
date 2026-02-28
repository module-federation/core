import { defineConfig } from 'tsdown';

const entry = {
  index: 'src/index.ts',
};

const baseConfig = {
  cwd: import.meta.dirname,
  tsconfig: 'tsconfig.json',
  clean: true,
  entry,
  external: ['@module-federation/sdk'],
};

export default defineConfig([
  {
    ...baseConfig,
    name: 'retry-plugin-cjs',
    outDir: 'dist',
    format: ['cjs'],
    dts: {
      resolver: 'tsc',
    },
    outExtensions: () => ({
      js: '.js',
      dts: '.d.ts',
    }),
  },
  {
    ...baseConfig,
    name: 'retry-plugin-esm',
    outDir: 'dist/esm',
    format: ['esm'],
    dts: false,
    outExtensions: () => ({
      js: '.js',
    }),
  },
]);
