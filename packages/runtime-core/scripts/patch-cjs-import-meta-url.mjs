import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist', import.meta.url).pathname;

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (fullPath.endsWith('.cjs')) {
      files.push(fullPath);
    }
  }
  return files;
}

const targetSnippet =
  "? new (require('url'.replace('', '')).URL)('file:' + __filename).href";
const replacementSnippet =
  "? (typeof __filename === 'string' ? 'file://' + __filename : '')";

for (const filePath of walk(distDir)) {
  const source = readFileSync(filePath, 'utf-8');
  if (!source.includes(targetSnippet)) {
    continue;
  }
  writeFileSync(filePath, source.split(targetSnippet).join(replacementSnippet));
}
