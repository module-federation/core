import { spawn } from 'node:child_process';
import { setup, teardown } from './remote-servers.mjs';

const configFile = process.argv[2];
if (!configFile) {
  throw new Error('Expected an Rstest config file.');
}

await setup();
try {
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'rstest', 'run', '-c', configFile], {
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });

  process.exitCode = exitCode;
} finally {
  await teardown();
}
