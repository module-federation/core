import { join } from 'path';
import { defineConfig } from 'tsup';

const shared = {
  entry: [join(__dirname, 'src', 'index.ts')],
  dts: true,
  splitting: true,
  outDir: join('packages', 'third-party-dts-extractor', 'dist'),
  external: [join(__dirname, 'package.json')],
};

export default defineConfig([
  { ...shared, format: 'cjs' as const, clean: true, noExternal: ['exsolve'] },
  { ...shared, format: 'esm' as const },
]);
