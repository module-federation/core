import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

type ChildProc = ReturnType<typeof spawn>;
type ServerTarget = {
  host: string;
  port: number;
  name: string;
};

const hostServer: ServerTarget = {
  host: '127.0.0.1',
  port: 3025,
  name: 'rstest-rsbuild host server',
};
const remoteServer: ServerTarget = {
  host: '127.0.0.1',
  port: 3016,
  name: 'rstest-rsbuild remote server',
};
const hostAppDir = path.resolve(__dirname, '..');
const remoteAppDir = path.resolve(__dirname, '../../rstest-remote');

declare global {
  // eslint-disable-next-line no-var
  var __RSTEST_RSBUILD_HOST__: ChildProc | undefined;
  // eslint-disable-next-line no-var
  var __RSTEST_RSBUILD_REMOTE__: ChildProc | undefined;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const canConnect = (target: ServerTarget) =>
  new Promise<boolean>((resolve) => {
    const socket = net.createConnection({
      host: target.host,
      port: target.port,
    });
    let settled = false;

    const settle = (value: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(1_000);
    socket.once('connect', () => settle(true));
    socket.once('error', () => settle(false));
    socket.once('timeout', () => settle(false));
  });

const waitForServer = async (target: ServerTarget, timeoutMs = 30_000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await canConnect(target)) {
      return;
    }
    await sleep(250);
  }
  throw new Error(
    `Timed out waiting for ${target.name} (${target.host}:${target.port})`,
  );
};

const startHost = () =>
  spawn('pnpm', ['serve'], {
    cwd: hostAppDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

const startRemote = () =>
  spawn('pnpm', ['serve'], {
    cwd: remoteAppDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

export const ensureDemoServers = async () => {
  if (
    globalThis.__RSTEST_RSBUILD_HOST__ &&
    globalThis.__RSTEST_RSBUILD_REMOTE__
  ) {
    return;
  }
  globalThis.__RSTEST_RSBUILD_HOST__ = startHost();
  globalThis.__RSTEST_RSBUILD_REMOTE__ = startRemote();
  await Promise.all([waitForServer(hostServer), waitForServer(remoteServer)]);
};

export const cleanupDemoServers = async () => {
  const host = globalThis.__RSTEST_RSBUILD_HOST__;
  const remote = globalThis.__RSTEST_RSBUILD_REMOTE__;

  if (host) {
    try {
      host.kill('SIGTERM');
    } catch {
      // no-op
    }
    globalThis.__RSTEST_RSBUILD_HOST__ = undefined;
  }

  if (remote) {
    try {
      remote.kill('SIGTERM');
    } catch {
      // no-op
    }
    globalThis.__RSTEST_RSBUILD_REMOTE__ = undefined;
  }
};
