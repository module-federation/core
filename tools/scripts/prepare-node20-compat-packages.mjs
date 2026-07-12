import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PACKAGES_DIR = join(ROOT, 'packages');
const OUTPUT_DIR = resolve(ROOT, process.argv[2] || 'artifacts/node20-compat');

rmSync(OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(PACKAGES_DIR, entry.name))
  .filter((packageDir) => existsSync(join(packageDir, 'package.json')))
  .filter((packageDir) => {
    const packageJson = JSON.parse(
      readFileSync(join(packageDir, 'package.json'), 'utf8'),
    );
    return packageJson.private !== true;
  })
  .sort();

for (const packageDir of packageDirs) {
  const result = spawnSync('pnpm', ['pack', '--pack-destination', OUTPUT_DIR], {
    cwd: packageDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`Failed to pack ${basename(packageDir)}`);
  }
}

const tarballs = readdirSync(OUTPUT_DIR).filter((file) =>
  file.endsWith('.tgz'),
);
if (tarballs.length !== packageDirs.length) {
  throw new Error(
    `Expected ${packageDirs.length} tarballs, found ${tarballs.length}`,
  );
}

console.log(
  `[node20-compat] Packed ${tarballs.length} publishable packages into ${OUTPUT_DIR}`,
);
