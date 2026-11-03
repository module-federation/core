import { readFile, writeFile } from 'node:fs/promises';

const file = 'dist/index.d.ts';
const sideEffectImport = "import '@module-federation/data-fetch';";

let content = await readFile(file, 'utf8');
if (!content.includes(sideEffectImport)) {
  content = `${sideEffectImport}\n${content}`;
}
await writeFile(file, content);
