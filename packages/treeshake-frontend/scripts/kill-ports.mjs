import { execSync } from 'node:child_process';

const ports = process.argv.slice(2).filter(Boolean);
if (!ports.length) {
  console.error('Usage: node scripts/kill-ports.mjs <port> [port...]');
  process.exit(2);
}

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('utf8')
      .trim();
  } catch {
    return '';
  }
}

for (const p of ports) {
  const port = String(p).replace(/[^0-9]/g, '');
  if (!port) continue;

  // macOS: list PIDs listening on TCP:<port>
  const out = run(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`);
  const pids = out.split(/\s+/).filter(Boolean);
  if (!pids.length) continue;

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL');
      console.log(`[kill-ports] killed pid=${pid} on port=${port}`);
    } catch {
      // ignore
    }
  }
}
