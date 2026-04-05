const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

const serverRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../../..');
const frontendDistIndex = path.resolve(
  repoRoot,
  'packages',
  'treeshake-frontend',
  'dist',
  'index.html',
);
const embeddedIndex = path.resolve(
  serverRoot,
  'dist',
  'frontend',
  'index.html',
);

const devEnv = path.join(serverRoot, '.env.development');
const envPath = fs.existsSync(devEnv) ? devEnv : path.join(serverRoot, '.env');
require('dotenv').config({ path: envPath });

const entry = path.join(serverRoot, 'dist', 'server.js');
if (
  !fs.existsSync(entry) ||
  !fs.existsSync(frontendDistIndex) ||
  !fs.existsSync(embeddedIndex)
) {
  execSync(
    'pnpm exec turbo run build --filter=@module-federation/treeshake-server',
    {
      cwd: serverRoot,
      stdio: 'inherit',
    },
  );
}

require(entry);
