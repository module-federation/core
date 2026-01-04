'use strict';

const fs = require('fs');
const path = require('path');

const pkgRoot = __dirname;
const distRoot = path.join(pkgRoot, 'dist');
const srcRoot = path.join(pkgRoot, 'src');

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function main() {
  ensureCleanDir(distRoot);
  if (fs.existsSync(srcRoot)) {
    copyDir(srcRoot, path.join(distRoot, 'src'));
  }

  console.log(`Built @rsc-demo/shared → ${path.relative(pkgRoot, distRoot)}`);
}

main();
