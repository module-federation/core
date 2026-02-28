import { defineConfig } from 'tsdown';

const SUPPORTED_BUNDLERS = [
  'esbuild',
  'rollup',
  'vite',
  'webpack',
  'rspack',
  'rolldown',
  'farm',
];

const entry = Object.fromEntries([
  ['index', 'src/index.ts'],
  ...SUPPORTED_BUNDLERS.map((bundler) => [bundler, `src/${bundler}.ts`]),
]);

export default defineConfig([
  {
    name: 'native-federation-tests-build',
    cwd: import.meta.dirname,
    tsconfig: 'tsconfig.lib.json',
    entry,
    dts: {
      resolver: 'tsc',
    },
    clean: true,
    minify: true,
    inlineOnly: false,
    format: ['cjs', 'esm'],
    outDir: 'dist',
  },
]);
