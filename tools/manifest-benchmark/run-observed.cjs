'use strict';
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const outputArg = args.find((arg) => arg.startsWith('--output='));
if (!outputArg) throw new Error('Explicit --output= directory required');
const output = path.resolve(outputArg.slice('--output='.length));
fs.mkdirSync(output, { recursive: true });
const observations = [];
function observe() {
  const processes = execFileSync('ps', ['-eo', 'pid=,ppid=,comm=,args='], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter((line) => {
      const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/);
      if (!match) return false;
      const [, pid, , command, argv] = match;
      if (
        Number(pid) === process.pid ||
        argv.includes(__dirname) ||
        argv.includes('--eval') ||
        argv.includes(' --mcp')
      )
        return false;
      return (
        /^(rustc|cc1|cc1plus|clang|clang\+\+)$/.test(command) ||
        (command === 'cargo' && /\b(build|test|bench|check)\b/.test(argv)) ||
        (/^(node|pnpm|npm|turbo)$/.test(command) &&
          /(?:\b(?:jest|rstest|webpack|rslib)\b|turbo run (?:build|test)|pnpm.*\b(?:run )?(?:build|test)\b)/.test(
            argv,
          ))
      );
    });
  observations.push({
    at: new Date().toISOString(),
    competingProcesses: processes,
  });
  return processes;
}
const initial = observe();
if (initial.length) {
  console.error(
    'Competing build/test process found; no benchmark started.\n' +
      initial.join('\n'),
  );
  fs.writeFileSync(
    path.join(output, 'process-observations.json'),
    JSON.stringify({ started: false, observations }, null, 2),
  );
  process.exitCode = 3;
} else {
  const startedAt = new Date().toISOString();
  const child = spawn(
    process.execPath,
    [path.join(__dirname, 'benchmark.cjs'), ...args],
    { stdio: 'inherit' },
  );
  const interval = setInterval(observe, 1000);
  child.on('exit', (code, signal) => {
    clearInterval(interval);
    observe();
    const contaminated = observations.some(
      (row) => row.competingProcesses.length,
    );
    fs.writeFileSync(
      path.join(output, 'process-observations.json'),
      JSON.stringify(
        {
          startedAt,
          endedAt: new Date().toISOString(),
          code,
          signal,
          contaminated,
          observations,
        },
        null,
        2,
      ),
    );
    console.log(
      `Process observation: ${observations.length} snapshots, competing build/test detected=${contaminated}`,
    );
    process.exitCode = code ?? 1;
  });
}
