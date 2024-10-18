import path from 'path';
import spawn from 'cross-spawn';

const kModernAppTools = path.join(
  __dirname,
  '../node_modules/@modern-js/app-tools/bin/modern.js',
);

function runModernCommand(
  argv: string[],
  options: { dir: string; cwd: string },
) {
  const { cwd } = options;
  const cmd = argv[0];
  const env = {
    ...process.env,
    NODE_ENV: 'production',
  };

  return new Promise((resolve, reject) => {
    const instance = spawn(process.execPath, [kModernAppTools, ...argv], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdoutOutput = '';

    let stderrOutput = '';

    instance.stderr.on('data', (chunk) => {
      stderrOutput += chunk;
    });

    instance.stdout.on('data', async (chunk) => {
      stdoutOutput += chunk;
    });

    instance.on('close', (code) => {
      resolve({
        code,
        stdout: stdoutOutput,
        stderr: stderrOutput,
      });
    });

    instance.on('error', (err) => {
      err.stdout = stdoutOutput;
      err.stderr = stderrOutput;
      reject(err);
    });
  });
}

export function modernBuild(dir, args = [], opts = {}) {
  return runModernCommand(['build', ...args], {
    cwd: dir,
    dir,
  });
}
