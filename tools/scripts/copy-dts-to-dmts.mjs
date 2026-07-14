import { copyFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const targetDir = process.argv[2] || 'dist';

async function copyDeclarations(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const filePath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await copyDeclarations(filePath);
        return;
      }

      if (entry.isFile() && entry.name.endsWith('.d.ts')) {
        await copyFile(filePath, filePath.replace(/\.d\.ts$/, '.d.mts'));
      }
    }),
  );
}

await copyDeclarations(targetDir);
