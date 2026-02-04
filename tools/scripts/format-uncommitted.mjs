#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function getUncommittedFiles() {
  try {
    const trackedChanged = execFileSync(
      'git',
      ['diff', '--name-only', '--no-renames', '--relative', 'HEAD', '--', '.'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    const untracked = execFileSync(
      'git',
      ['ls-files', '--others', '--exclude-standard', '--', '.'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    return Array.from(new Set([...trackedChanged, ...untracked]));
  } catch (error) {
    console.error('Failed to read uncommitted files:', error.message || error);
    return [];
  }
}

const files = getUncommittedFiles();
const filtered = files
  .filter((file) => !/[\\/]node_modules[\\/]/.test(file))
  .filter((file) => {
    try {
      return fs.existsSync(file);
    } catch {
      return false;
    }
  });

if (filtered.length === 0) {
  process.exit(0);
}

execFileSync('npx', ['nx', 'format:write', '--files', filtered.join(',')], {
  stdio: 'inherit',
});
