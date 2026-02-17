import { spawn } from 'node:child_process';
import path from 'node:path';

type ChildProc = ReturnType<typeof spawn>;

const hostUrl = 'http://127.0.0.1:3015/';
const remoteUrl = 'http://127.0.0.1:3016/remoteEntry.js';
const hostAppDir = path.resolve(__dirname, '..');
const remoteAppDir = path.resolve(__dirname, '../../rstest-remote');

declare global {
  // eslint-disable-next-line no-var
  var __RSTEST_DEMO_HOST__: ChildProc | undefined;
  // eslint-disable-next-line no-var
  var __RSTEST_DEMO_REMOTE__: ChildProc | undefined;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForUrl = async (url: string, timeoutMs = 30_000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // keep polling while server starts
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const startRemote = () => {
  const child = spawn('pnpm', ['serve'], {
    cwd: remoteAppDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.once('exit', (code) => {
    if (code !== 0) {
      console.error(`[rstest-demo] remote server exited with code ${code}`);
    }
  });

  return child;
};

const startHost = () => {
  const child = spawn('pnpm', ['serve'], {
    cwd: hostAppDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.once('exit', (code) => {
    if (code !== 0) {
      console.error(`[rstest-demo] host server exited with code ${code}`);
    }
  });

  return child;
};

export const ensureDemoServers = async () => {
  if (globalThis.__RSTEST_DEMO_HOST__ && globalThis.__RSTEST_DEMO_REMOTE__) {
    return;
  }

  globalThis.__RSTEST_DEMO_HOST__ = startHost();
  globalThis.__RSTEST_DEMO_REMOTE__ = startRemote();
  await Promise.all([waitForUrl(hostUrl), waitForUrl(remoteUrl)]);
};

export const cleanupDemoServers = async () => {
  const hostChild = globalThis.__RSTEST_DEMO_HOST__;
  const child = globalThis.__RSTEST_DEMO_REMOTE__;

  if (hostChild) {
    try {
      hostChild.kill('SIGTERM');
    } catch {
      // no-op
    }
    globalThis.__RSTEST_DEMO_HOST__ = undefined;
  }

  if (child) {
    try {
      child.kill('SIGTERM');
    } catch {
      // no-op
    }
    globalThis.__RSTEST_DEMO_REMOTE__ = undefined;
  }
};
