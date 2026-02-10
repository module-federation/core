import fs from 'node:fs';
import path from 'node:path';

const backendDir = path.resolve(process.cwd(), '../treeshake-server');

if (!fs.existsSync(backendDir)) {
  console.error(`[e2e] local backend dir not found: ${backendDir}`);
  process.exit(1);
}

const pkgJson = path.join(backendDir, 'package.json');
if (!fs.existsSync(pkgJson)) {
  console.error(`[e2e] local backend package.json not found: ${pkgJson}`);
  process.exit(1);
}

console.log(`[e2e] local backend OK: ${backendDir}`);
