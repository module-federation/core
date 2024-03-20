import { join } from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: join(__dirname, 'src/index.ts'),
    forkDevWorker: join(__dirname, 'src/lib/forkDevWorker.ts'),
  },
  dts: true,
  splitting: true,
  clean: true,
  format: ['cjs', 'esm'],
  outDir: 'packages/dev-kit/dist',
  external: [join(__dirname, 'package.json')],
});
