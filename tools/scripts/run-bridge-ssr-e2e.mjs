#!/usr/bin/env node
import { spawn } from 'node:child_process';
import {
  DETACHED_PROCESS_GROUP,
  shutdownServe,
  spawnWithPromise,
} from './e2e-process-utils.mjs';

const viteSmoke = process.env.BRIDGE_SSR_REMOTE_BUNDLER === 'vite';
const production = process.env.BRIDGE_SSR_MODE === 'production' || viteSmoke;
let stopping = false;

function startOwned(label, command, args, env) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    detached: true,
    env: { ...process.env, ...env },
  });
  child[DETACHED_PROCESS_GROUP] = true;
  const exit = new Promise((resolve, reject) => {
    child.once('exit', (code, signal) => {
      if (stopping) resolve({ code, signal });
      else
        reject(new Error(`${label} exited unexpectedly (${signal ?? code})`));
    });
    child.once('error', reject);
  });
  return { child, exit };
}

async function run(command, args, env) {
  await spawnWithPromise(command, args, {
    env: { ...process.env, ...env },
  }).promise;
}

async function build(env) {
  if (viteSmoke) {
    await run(
      'pnpm',
      ['--filter', 'bridge-ssr-remote-vue', 'run', 'build:vite'],
      env,
    );
    await run(
      'pnpm',
      [
        'exec',
        'turbo',
        'run',
        'build',
        '--filter=bridge-ssr-host',
        '--force',
        '--env-mode=loose',
      ],
      env,
    );
  } else {
    await run(
      'pnpm',
      [
        'exec',
        'turbo',
        'run',
        'build',
        '--filter=bridge-ssr-host',
        '--filter=bridge-ssr-host-vue',
        '--filter=bridge-ssr-remote-react',
        '--filter=bridge-ssr-remote-vue',
      ],
      env,
    );
  }
  await run(
    process.execPath,
    ['tools/scripts/verify-bridge-ssr-browser-bundles.mjs'],
    env,
  );
}

async function main() {
  const env = {
    HOST: process.env.HOST ?? 'localhost',
    BRIDGE_SSR_REMOTE_BUNDLER: viteSmoke ? 'vite' : 'rsbuild',
    ...(production ? { BRIDGE_SSR_MODE: 'production' } : {}),
  };
  if (production) await build(env);

  const apps = [];
  if (viteSmoke) {
    apps.push(
      startOwned(
        'Vue Vite remote',
        process.execPath,
        [
          'apps/bridge-ssr-demo/shared/serveDist.mjs',
          'apps/bridge-ssr-demo/remote-vue/dist-vite',
          '2402',
        ],
        env,
      ),
      startOwned(
        'React production host',
        'pnpm',
        ['--filter', 'bridge-ssr-host', 'run', 'serve:production'],
        env,
      ),
    );
  } else if (production) {
    for (const [framework, port] of [
      ['react', '2301'],
      ['vue', '2302'],
    ]) {
      apps.push(
        startOwned(
          `${framework} remote`,
          process.execPath,
          [
            'apps/bridge-ssr-demo/shared/serveDist.mjs',
            `apps/bridge-ssr-demo/remote-${framework}/dist`,
            port,
          ],
          env,
        ),
      );
    }
    apps.push(
      startOwned(
        'React production host',
        'pnpm',
        ['--filter', 'bridge-ssr-host', 'run', 'serve:production'],
        env,
      ),
      startOwned(
        'Vue production host',
        'pnpm',
        ['--filter', 'bridge-ssr-host-vue', 'run', 'serve:production'],
        env,
      ),
    );
  } else {
    apps.push(
      startOwned(
        'React remote',
        'pnpm',
        ['--filter', 'bridge-ssr-remote-react', 'run', 'dev'],
        env,
      ),
      startOwned(
        'Vue remote',
        'pnpm',
        ['--filter', 'bridge-ssr-remote-vue', 'run', 'dev'],
        env,
      ),
      startOwned(
        'React host',
        'pnpm',
        ['--filter', 'bridge-ssr-host', 'run', 'dev'],
        env,
      ),
      startOwned(
        'Vue host',
        'pnpm',
        ['--filter', 'bridge-ssr-host-vue', 'run', 'dev'],
        env,
      ),
    );
  }

  try {
    const ports = viteSmoke
      ? ['tcp:2300', 'tcp:2402']
      : ['tcp:2300', 'tcp:2301', 'tcp:2302', 'tcp:2303'];
    await Promise.race([
      spawnWithPromise('npx', ['wait-on', '--timeout=240000', ...ports])
        .promise,
      Promise.race(apps.map((app) => app.exit)),
    ]);
    await Promise.race([
      run('pnpm', ['--filter', 'bridge-ssr-host', 'run', 'e2e:ssr:ci'], env),
      Promise.race(apps.map((app) => app.exit)),
    ]);
    if (!viteSmoke) {
      await Promise.race([
        run(
          'pnpm',
          ['--filter', 'bridge-ssr-host-vue', 'run', 'e2e:ssr:ci'],
          env,
        ),
        Promise.race(apps.map((app) => app.exit)),
      ]);
    }
  } finally {
    stopping = true;
    await Promise.allSettled(
      apps.map(({ child, exit }) => shutdownServe(child, exit)),
    );
  }
}

process.on('uncaughtException', (error) => {
  console.error('[bridge-ssr-e2e] uncaught exception', error);
  process.exitCode = 1;
});
process.on('unhandledRejection', (error) => {
  console.error('[bridge-ssr-e2e] unhandled rejection', error);
  process.exitCode = 1;
});

main().catch((error) => {
  console.error('[bridge-ssr-e2e] failed', error);
  process.exitCode = 1;
});
