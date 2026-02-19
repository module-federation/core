#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const args = process.argv.slice(2);
let outFile = null;
let keepTmp = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--out' && args[i + 1]) {
    outFile = args[i + 1];
    i += 1;
    continue;
  }
  if (arg === '--keep-tmp') {
    keepTmp = true;
    continue;
  }
}

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const upstreamName = process.env.UPSTREAM_NAME || 'react-server-dom-webpack';
const upstreamVersion = process.env.UPSTREAM_VERSION || pkg.version;

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rsdw-upstream-'));
const localDir = path.resolve(__dirname, '..');

function cleanup() {
  if (!keepTmp) {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

try {
  const packOutput = execSync(`npm pack ${upstreamName}@${upstreamVersion}`, {
    cwd: tmpRoot,
    stdio: ['ignore', 'pipe', 'inherit'],
  })
    .toString()
    .trim()
    .split('\n')
    .pop();

  execSync(`tar -xzf ${packOutput}`, {
    cwd: tmpRoot,
    stdio: 'inherit',
  });

  const upstreamDir = path.join(tmpRoot, 'package');
  const diffArgs = ['diff', '--no-index', '--', upstreamDir, localDir];

  if (outFile) {
    const result = spawnSync('git', diffArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    fs.writeFileSync(outFile, result.stdout || '', 'utf8');
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    if (result.status && result.status > 1) {
      process.exit(result.status);
    }
  } else {
    const result = spawnSync('git', diffArgs, { stdio: 'inherit' });
    if (result.status && result.status > 1) {
      process.exit(result.status);
    }
  }
} finally {
  cleanup();
}
