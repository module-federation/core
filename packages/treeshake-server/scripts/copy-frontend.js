const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '../../..');
const serverRoot = path.resolve(__dirname, '..');
const frontendDist = path.join(
  repoRoot,
  'packages',
  'treeshake-frontend',
  'dist',
);
const frontendIndex = path.join(frontendDist, 'index.html');
const targetDir = path.join(serverRoot, 'dist', 'frontend');

if (!fs.existsSync(frontendIndex)) {
  throw new Error(
    `Treeshake frontend dist not found. Expected ${frontendIndex}.`,
  );
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(frontendDist, targetDir, { recursive: true });
