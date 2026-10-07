import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildRemotes } from './build-remotes.mjs';

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(cwd);
await buildRemotes();
const children = [
  spawn(process.execPath, ['--env-file-if-exists=.env', 'server/index.ts'], {
    cwd,
    stdio: 'inherit',
  }),
  spawn('pnpm', ['exec', 'modern', 'dev'], { cwd, stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => stop(code ?? 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
