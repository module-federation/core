#!/usr/bin/env node
/**
 * Best-effort "kill whatever is listening on these ports" helper for CI stability.
 *
 * We prefer using OS tools rather than trying to re-implement socket inspection.
 * - linux: `fuser -k <port>/tcp`
 * - darwin: `lsof -ti tcp:<port>` + kill
 */

import { spawnSync } from 'node:child_process';

const ports = process.argv.slice(2).filter(Boolean);
if (ports.length === 0) {
  process.exit(0);
}

const platform = process.platform;

const run = (cmd, args) => {
  return spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8' });
};

const killPids = (pids, signal) => {
  for (const pid of pids) {
    if (!pid) continue;
    run('kill', [`-${signal}`, pid]);
  }
};

for (const port of ports) {
  if (!/^\d+$/.test(port)) continue;

  if (platform === 'linux') {
    // fuser exits non-zero if nothing was killed; that's fine.
    run('fuser', ['-k', `${port}/tcp`]);
    continue;
  }

  if (platform === 'darwin') {
    const res = run('lsof', ['-ti', `tcp:${port}`]);
    const pids = (res.stdout || '')
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Terminate gracefully first, then force kill.
    killPids(pids, 'TERM');
    killPids(pids, 'KILL');
    continue;
  }
}
