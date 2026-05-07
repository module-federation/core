import { defineConfig } from 'tsdown';

const entry = {
  index: 'src/index.ts',
  node: 'src/node.ts',
};

const baseConfig = {
  cwd: import.meta.dirname,
  tsconfig: 'tsconfig.json',
  clean: true,
  entry,
  external: ['@module-federation/runtime'],
};

export default defineConfig([
  {
    ...baseConfig,
    name: 'diagnostics-plugin-cjs',
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
    name: 'diagnostics-plugin-esm',
    outDir: 'dist/esm',
    format: ['esm'],
    dts: false,
    outExtensions: () => ({
      js: '.js',
    }),
  },
]);
