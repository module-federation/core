import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const entrypoints = {
  'dist/server-middleware.d.ts': [
    "export { default } from './data-fetch-server-middleware';",
  ],
};

for (const [file, lines] of Object.entries(entrypoints)) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${lines.join('\n')}\n`);
}
