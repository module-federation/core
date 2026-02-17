import { spawn } from 'node:child_process';
import path from 'node:path';

const remoteAppDir = path.resolve(__dirname, '../../rstest-remote');

const run = async (cwd: string, cmd: string, args: string[]) => {
  const child = spawn(cmd, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  await new Promise<void>((resolve, reject) => {
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
    });
    child.once('error', (err) => reject(err));
  });
};

export async function setup() {
  await run(remoteAppDir, 'pnpm', ['build:node']);
}

export async function teardown() {
  // no-op
}
