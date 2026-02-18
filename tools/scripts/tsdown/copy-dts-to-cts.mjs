import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

function walkFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function toCtsPath(dtsPath) {
  return `${dtsPath.slice(0, -'.d.ts'.length)}.d.cts`;
}

const distDir = resolve(process.cwd(), process.argv[2] || 'dist');

if (!existsSync(distDir)) {
  console.error(`[copy-dts-to-cts] Dist directory not found: ${distDir}`);
  process.exit(1);
}

const declarationFiles = walkFiles(distDir).filter((filePath) =>
  filePath.endsWith('.d.ts'),
);

let copiedCount = 0;

for (const declarationFile of declarationFiles) {
  const ctsFile = toCtsPath(declarationFile);
  copyFileSync(declarationFile, ctsFile);
  copiedCount += 1;
}

console.log(
  `[copy-dts-to-cts] Copied ${copiedCount} declaration files in ${distDir}`,
);
