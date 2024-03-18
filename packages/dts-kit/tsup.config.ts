import { join } from 'path';
import { defineConfig } from 'tsup';

const ENTRYIES = ['src/index.ts', 'src/forkGenerateTypes.ts'];

export default defineConfig({
  entry: [
    join(__dirname, 'src', 'index.ts'),
    ...ENTRYIES.map((e) => join(__dirname, 'src', `${e}.ts`)),
  ],
  dts: true,
  splitting: true,
  clean: true,
  format: ['cjs', 'esm'],
  outDir: 'packages/dts-kit/dist',
  external: [join(__dirname, 'package.json')],
});
