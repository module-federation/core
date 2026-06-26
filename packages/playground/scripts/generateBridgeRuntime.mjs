import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(
  appRoot,
  'node_modules/@module-federation/bridge-react/dist',
);
const outputFile = path.join(appRoot, 'src/generated/bridgeRuntimeFiles.ts');
const entryFile = 'index.es.js';

const relativeImportPattern = /from ["'](\.\/[^"']+)["']/g;

function resolveBridgeFiles() {
  const seen = new Set();
  const queue = [entryFile];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || seen.has(current)) {
      continue;
    }

    const absolutePath = path.join(sourceRoot, current);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing bridge runtime file: ${absolutePath}`);
    }

    seen.add(current);
    const source = fs.readFileSync(absolutePath, 'utf8');

    for (const match of source.matchAll(relativeImportPattern)) {
      const nextImport = match[1];
      let nextFile = path
        .normalize(path.join(path.dirname(current), nextImport))
        .replace(/\\/g, '/');

      if (!path.extname(nextFile)) {
        if (fs.existsSync(path.join(sourceRoot, `${nextFile}.js`))) {
          nextFile = `${nextFile}.js`;
        } else if (fs.existsSync(path.join(sourceRoot, `${nextFile}.mjs`))) {
          nextFile = `${nextFile}.mjs`;
        }
      }

      if (!seen.has(nextFile)) {
        queue.push(nextFile);
      }
    }
  }

  return Array.from(seen).sort();
}

function buildOutput(files) {
  const body = files
    .map((filename) => {
      const source = fs.readFileSync(path.join(sourceRoot, filename), 'utf8');
      return `\t${JSON.stringify(filename)}: ${JSON.stringify(source)}`;
    })
    .join(',\n');

  return `export const BRIDGE_RUNTIME_FILES = {\n${body}\n} as const;\n`;
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, buildOutput(resolveBridgeFiles()));
