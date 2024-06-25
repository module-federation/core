import { join } from 'path';
import { defineConfig } from 'tsup';

const SUPPORTED_BUNDLERS = [
  'esbuild',
  'rollup',
  'vite',
  'webpack',
  'rspack',
  'rolldown',
  'farm',
];

export default defineConfig({
  entry: [
    join(__dirname, 'src', 'index.ts'),
    ...SUPPORTED_BUNDLERS.map((bundler) =>
      join(__dirname, 'src', `${bundler}.ts`),
    ),
  ],
  dts: true,
  splitting: true,
  clean: true,
  minify: true,
  format: ['cjs', 'esm'],
  outDir: join('packages', 'native-federation-typescript', 'dist'),
  external: [join(__dirname, 'package.json')],
});
