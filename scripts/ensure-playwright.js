#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

const LOCK_FILE = path.join(os.tmpdir(), '.playwright-install.lock');
const MAX_WAIT_MS = 180000; // 3 minutes
const POLL_MS = 2000;

/**
 * Try to acquire a file-based lock. Returns true if acquired.
 */
const tryAcquireLock = () => {
  try {
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if the lock is stale (owner process no longer running).
 */
const isLockStale = () => {
  try {
    const lockPid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8'), 10);
    if (Number.isNaN(lockPid)) return true;
    process.kill(lockPid, 0); // just checks if process exists
    return false; // process is still running
  } catch (err) {
    if (err.code === 'ENOENT') return true; // lock file gone
    if (err.code === 'ESRCH') return true; // process doesn't exist
    return false; // assume alive on other errors
  }
};

const releaseLock = () => {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {}
};

/**
 * Wait for the lock to be released, then return.
 */
const waitForLock = () => {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    if (!fs.existsSync(LOCK_FILE)) return;
    if (isLockStale()) {
      try {
        fs.unlinkSync(LOCK_FILE);
      } catch {}
      return;
    }
    execSync(`sleep ${POLL_MS / 1000}`);
  }
  // Timed out waiting; remove stale lock and proceed
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {}
};

const ensurePlaywright = () => {
  let chromium;
  try {
    const resolved = require.resolve('@playwright/test', {
      paths: [process.cwd()],
    });
    ({ chromium } = require(resolved));
  } catch (error) {
    console.error(
      '[ensure-playwright] @playwright/test is not available from the current working directory. Install dependencies first.',
    );
    throw error;
  }

  const executablePath = chromium.executablePath();
  if (fs.existsSync(executablePath)) {
    return;
  }

  // Another process may already be installing; wait for it
  if (fs.existsSync(LOCK_FILE) && !isLockStale()) {
    console.log(
      '[ensure-playwright] Another install is in progress, waiting...',
    );
    waitForLock();
    // Re-check after the other install finishes
    if (fs.existsSync(executablePath)) {
      console.log('[ensure-playwright] Browser now available.');
      return;
    }
  }

  // Acquire lock before installing
  if (!tryAcquireLock()) {
    // Lost the race; wait and re-check
    console.log(
      '[ensure-playwright] Another install is in progress, waiting...',
    );
    waitForLock();
    if (fs.existsSync(executablePath)) {
      console.log('[ensure-playwright] Browser now available.');
      return;
    }
    // Still missing after wait; try to acquire again
    tryAcquireLock();
  }

  const installArgs =
    process.platform === 'linux'
      ? 'playwright install --with-deps'
      : 'playwright install';

  console.log(
    `[ensure-playwright] Missing browser. Running "pnpm exec ${installArgs}"...`,
  );
  try {
    execSync(`pnpm exec ${installArgs}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } finally {
    releaseLock();
  }
};

ensurePlaywright();
