import { defineConfig } from 'tsdown';

const entry = {
  index: 'src/index.ts',
  node: 'src/node.ts',
  build: 'src/build.ts',
};

const baseConfig = {
  cwd: import.meta.dirname,
  tsconfig: 'tsconfig.json',
  clean: true,
  entry,
  external: ['@module-federation/runtime', 'node:fs', 'node:path'],
};

export default defineConfig([
  {
    ...baseConfig,
    name: 'observability-plugin-cjs',
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
    name: 'observability-plugin-esm',
    outDir: 'dist/esm',
    format: ['esm'],
    dts: false,
    outExtensions: () => ({
      js: '.js',
    }),
  },
]);
