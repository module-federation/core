#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import http from 'node:http';

const DEFAULT_CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function print(payload, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }
  if (payload.ok) {
    process.stdout.write(`${payload.message}\n`);
    return;
  }
  process.stderr.write(`${payload.message}\n`);
}

function checkDebugPort(port) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/json/version',
        timeout: 1000,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            body,
          });
        });
      },
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
    req.on('error', (error) => {
      resolve({ ok: false, error: error.message });
    });
  });
}

async function waitForDebugPort(port, timeoutMs) {
  const startedAt = Date.now();
  let lastResult;
  while (Date.now() - startedAt < timeoutMs) {
    lastResult = await checkDebugPort(port);
    if (lastResult.ok) return lastResult;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return lastResult || { ok: false, error: 'timeout' };
}

const port = Number(readArg('port', process.env.CHROME_DEBUG_PORT || '9222'));
const url = readArg('url', 'about:blank');
const chrome = readArg('chrome', process.env.CHROME_BIN || DEFAULT_CHROME);
const timeoutMs = Number(readArg('timeout-ms', '15000'));
const explicitUserDataDir = readArg('user-data-dir');
const json = hasFlag('json');
const dryRun = hasFlag('dry-run');

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  print(
    {
      ok: false,
      message: `Invalid Chrome debug port: ${String(port)}`,
    },
    json,
  );
  process.exit(1);
}

const existing = await checkDebugPort(port);
if (existing.ok) {
  print(
    {
      ok: true,
      status: 'already-running',
      port,
      url: `http://127.0.0.1:${port}/json/version`,
      message: `Chrome debug port already available on ${port}.`,
    },
    json,
  );
  process.exit(0);
}

try {
  await access(chrome);
} catch {
  print(
    {
      ok: false,
      status: 'chrome-not-found',
      chrome,
      message: `Chrome executable not found: ${chrome}`,
    },
    json,
  );
  process.exit(1);
}

const args = [
  `--remote-debugging-port=${port}`,
  '--new-window',
  '--no-first-run',
  '--no-default-browser-check',
  url,
];

if (explicitUserDataDir) {
  args.splice(1, 0, `--user-data-dir=${explicitUserDataDir}`);
}

if (dryRun) {
  print(
    {
      ok: true,
      status: 'dry-run',
      chrome,
      args,
      message:
        'Dry run only. This would launch Chrome with the user profile and remote debugging enabled.',
    },
    json,
  );
  process.exit(0);
}

if (explicitUserDataDir) {
  await mkdir(explicitUserDataDir, { recursive: true });
}

try {
  const child = spawn(chrome, args, {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
} catch (error) {
  print(
    {
      ok: false,
      status: 'launch-failed',
      chrome,
      args,
      message: `Failed to launch Chrome: ${error.message}`,
    },
    json,
  );
  process.exit(1);
}

const ready = await waitForDebugPort(port, timeoutMs);
if (ready.ok) {
  print(
    {
      ok: true,
      status: 'started',
      port,
      chrome,
      url: `http://127.0.0.1:${port}/json/version`,
      message: `Chrome debug port ready on ${port}.`,
    },
    json,
  );
  process.exit(0);
}

print(
  {
    ok: false,
    status: 'debug-port-unavailable',
    port,
    chrome,
    args,
    lastError: ready.error,
    message:
      'Chrome debug port did not become available after launching Chrome with the user profile. Chrome may already be running without remote debugging; do not switch to a temporary profile unless the user explicitly allows a stateless run.',
  },
  json,
);
process.exit(2);
