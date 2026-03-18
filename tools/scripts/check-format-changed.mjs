#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  hasGitRef as hasGitRefInRepo,
  listChangedFiles,
  resolveGitCommit as resolveGitCommitInRepo,
} from './turbo-script-utils.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const CHECK_BATCH_SIZE = 100;

main();

function main() {
  const requestedBase = parseBaseArg(process.argv.slice(2));
  const baseRef = resolveBaseRef(requestedBase);

  if (!baseRef) {
    console.warn(
      '[format-check] Unable to resolve a base ref. Skipping format check.',
    );
    process.exit(0);
  }

  const changedFiles = listChangedFiles(ROOT, baseRef, 'HEAD', {
    diffFilter: 'ACMR',
    errorPrefix: '[format-check] Failed to compute changed files',
  });
  if (changedFiles.length === 0) {
    console.log(
      `[format-check] No changed files detected between ${baseRef}...HEAD. Skipping format check.`,
    );
    process.exit(0);
  }

  console.log(
    `[format-check] Checking formatting for ${changedFiles.length} changed file(s) from ${baseRef}...HEAD.`,
  );

  for (let index = 0; index < changedFiles.length; index += CHECK_BATCH_SIZE) {
    const batch = changedFiles.slice(index, index + CHECK_BATCH_SIZE);
    const result = spawnSync(
      'pnpm',
      ['exec', 'prettier', '--check', '--ignore-unknown', ...batch],
      {
        cwd: ROOT,
        stdio: 'inherit',
        env: process.env,
      },
    );

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

function parseBaseArg(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--base' && argv[i + 1]) {
      return argv[i + 1];
    }
    if (token.startsWith('--base=')) {
      return token.slice('--base='.length);
    }
  }
  return null;
}

function resolveBaseRef(preferredRef) {
  const headCommit = resolveGitCommit('HEAD');
  if (hasGitRef(preferredRef)) {
    const preferredCommit = resolveGitCommit(preferredRef);
    if (!headCommit || preferredCommit !== headCommit) {
      return preferredRef;
    }
  }

  const refs = [];
  if (process.env.CI_BASE_REF) {
    refs.push(process.env.CI_BASE_REF);
  }
  if (process.env.CI_LOCAL_BASE_REF) {
    refs.push(process.env.CI_LOCAL_BASE_REF);
  }
  if (process.env.GITHUB_BASE_REF) {
    refs.push(`origin/${process.env.GITHUB_BASE_REF}`);
    refs.push(process.env.GITHUB_BASE_REF);
  }
  if (process.env.GITHUB_EVENT_BEFORE) {
    refs.push(process.env.GITHUB_EVENT_BEFORE);
  }
  refs.push(...getEventBaseCandidates());
  refs.push('origin/main', 'main', 'HEAD~1');

  for (const ref of refs) {
    if (!hasGitRef(ref)) {
      continue;
    }

    const candidateCommit = resolveGitCommit(ref);
    if (!headCommit || candidateCommit !== headCommit) {
      return ref;
    }
  }

  return null;
}

function getEventBaseCandidates() {
  const refs = new Set();
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return [];
  }

  try {
    const payload = JSON.parse(readFileSync(eventPath, 'utf-8'));
    if (payload?.pull_request?.base?.sha) {
      refs.add(payload.pull_request.base.sha);
    }
    if (payload?.pull_request?.base?.ref) {
      refs.add(`origin/${payload.pull_request.base.ref}`);
      refs.add(payload.pull_request.base.ref);
    }
    if (payload?.before) {
      refs.add(payload.before);
    }
  } catch {
    return [];
  }

  return Array.from(refs);
}

function hasGitRef(ref) {
  return hasGitRefInRepo(ROOT, ref);
}

function resolveGitCommit(ref) {
  return resolveGitCommitInRepo(ROOT, ref);
}
