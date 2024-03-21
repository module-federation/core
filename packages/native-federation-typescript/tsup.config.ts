import { join } from 'path';
import { defineConfig } from 'tsup';

const SUPPORTED_BUNDLERS = [
  'esbuild',
  'rollup',
  'vite',
  'webpack',
  'rspack',
  'rolldown',
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
  format: ['cjs', 'esm'],
  outDir: 'packages/native-federation-typescript/dist',
  external: [join(__dirname, 'package.json')],
});
