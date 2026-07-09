import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist/cjs', { recursive: true });
await writeFile(
  'dist/cjs/index.d.ts',
  "export * from './component';\nexport { default } from './component';\n",
);
