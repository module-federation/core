import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { isIP } from 'node:net';

const isPhoneReachableHostname = (hostname) => {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === 'localhost' || normalized.endsWith('.localhost')) {
    return false;
  }
  if (isIP(normalized) === 4) {
    const firstOctet = Number(normalized.split('.')[0]);
    return firstOctet !== 0 && firstOctet !== 127;
  }
  if (isIP(normalized) === 6) {
    if (normalized.startsWith('::ffff:')) {
      const mapped = normalized.slice('::ffff:'.length);
      const firstOctet = mapped.includes('.')
        ? Number(mapped.split('.')[0])
        : Number.parseInt(mapped.split(':')[0], 16) >> 8;
      if (firstOctet === 0 || firstOctet === 127) return false;
    }
    return normalized !== '::' && normalized !== '::1';
  }
  return true;
};

const origin = process.env.LYNX_REMOTE_ORIGIN;
assert.ok(
  origin,
  'Set LYNX_REMOTE_ORIGIN to the phone-reachable LAN origin, for example http://192.168.1.10:3000.',
);
const url = new URL(origin);
assert.equal(
  url.protocol,
  'http:',
  'LYNX_REMOTE_ORIGIN must use HTTP because the Rspeedy development server does not terminate TLS.',
);
assert.ok(
  url.pathname === '/' &&
    !url.search &&
    !url.hash &&
    !url.username &&
    !url.password,
  'LYNX_REMOTE_ORIGIN must be an HTTP origin without a path, credentials, query, or fragment.',
);
assert.ok(
  isPhoneReachableHostname(url.hostname),
  'LYNX_REMOTE_ORIGIN must be reachable from the phone, not a loopback or unspecified address.',
);

if (process.argv.includes('--check-origin')) process.exit(0);

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
