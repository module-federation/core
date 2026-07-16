import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const origin = process.env.LYNX_REMOTE_ORIGIN;
assert.ok(
  origin,
  'Set LYNX_REMOTE_ORIGIN to the phone-reachable LAN origin, for example http://192.168.1.10:3000.',
);
const url = new URL(origin);
assert.ok(
  url.protocol === 'http:' || url.protocol === 'https:',
  'LYNX_REMOTE_ORIGIN must use HTTP(S).',
);
assert.ok(
  !['localhost', '127.0.0.1', '::1'].includes(url.hostname),
  'LYNX_REMOTE_ORIGIN must be reachable from the phone, not a loopback address.',
);

const child = spawn('pnpm', ['run', 'dev'], {
  env: {
    ...process.env,
    LYNX_DEV_HOST: '0.0.0.0',
  },
  stdio: 'inherit',
});
child.once('error', (error) => {
  throw error;
});
child.once('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
