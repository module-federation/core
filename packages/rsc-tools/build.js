'use strict';

const fs = require('fs');
const path = require('path');

const pkgRoot = __dirname;
const distRoot = path.join(pkgRoot, 'dist');

const COPY_DIRS = ['runtime', 'webpack'];

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function main() {
  ensureCleanDir(distRoot);

  for (const dir of COPY_DIRS) {
    const src = path.join(pkgRoot, dir);
    if (!fs.existsSync(src)) continue;
    copyDir(src, path.join(distRoot, dir));
  }

  console.log(
    `Built @module-federation/rsc-tools → ${path.relative(pkgRoot, distRoot)}`,
  );
}

main();
