#!/usr/bin/env node

import { execFileSync, execSync } from 'node:child_process';

function getUncommittedFiles() {
  try {
    const output = execSync(
      'git diff --name-only --no-renames --relative HEAD .',
      {
        encoding: 'utf8',
      },
    ).trim();
    if (!output) {
      return [];
    }
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Failed to read uncommitted files:', error.message || error);
    return [];
  }
}

const files = getUncommittedFiles();
const filtered = files.filter((file) => !/[\\/]node_modules[\\/]/.test(file));

if (filtered.length === 0) {
  process.exit(0);
}

execFileSync('npx', ['nx', 'format:write', '--files', filtered.join(',')], {
  stdio: 'inherit',
});
