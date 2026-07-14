import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist/types', { recursive: true });
await writeFile(
  'dist/types/index.d.ts',
  "export * from './component';\nexport { default } from './component';\n",
);
