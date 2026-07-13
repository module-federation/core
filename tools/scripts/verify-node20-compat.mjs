import {
  cpSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const FIXTURE_DIR = join(ROOT, 'tools/fixtures/node20-compat');
const TARBALL_DIR = resolve(ROOT, process.argv[2] || 'artifacts/node20-compat');
const EXPECTED_NODE_VERSION = '20.19.5';

if (process.versions.node !== EXPECTED_NODE_VERSION) {
  throw new Error(
    `This compatibility check must run on Node.js ${EXPECTED_NODE_VERSION}; received ${process.versions.node}`,
  );
}

const tarballs = readdirSync(TARBALL_DIR)
  .filter((file) => file.endsWith('.tgz'))
  .map((file) => resolve(TARBALL_DIR, file));

if (tarballs.length === 0) {
  throw new Error(`No package tarballs found in ${TARBALL_DIR}`);
}

const consumerDir = mkdtempSync(join(tmpdir(), 'mf-node20-compat-'));

try {
  cpSync(FIXTURE_DIR, consumerDir, { recursive: true });

  const rootPackageJson = JSON.parse(
    readFileSync(join(ROOT, 'package.json'), 'utf8'),
  );
  const packageJson = JSON.parse(
    readFileSync(join(consumerDir, 'package.json'), 'utf8'),
  );

  packageJson.devDependencies = {
    '@rspack/cli': rootPackageJson.devDependencies['@rspack/cli'],
    '@rspack/core': rootPackageJson.devDependencies['@rspack/core'],
    '@swc/core': rootPackageJson.devDependencies['@swc/core'],
    '@types/node': rootPackageJson.devDependencies['@types/node'],
    'swc-loader': rootPackageJson.devDependencies['swc-loader'],
    typescript: rootPackageJson.devDependencies.typescript,
    webpack: rootPackageJson.devDependencies.webpack,
    'webpack-cli': rootPackageJson.devDependencies['webpack-cli'],
  };
  for (const tarball of tarballs) {
    const packageJsonOutput = run(
      'tar',
      ['-xOf', tarball, 'package/package.json'],
      { cwd: consumerDir, printOutput: false },
    );
    const packageName = JSON.parse(packageJsonOutput);
    packageJson.dependencies[packageName.name] = `file:${tarball}`;
  }

  writeFileSync(
    join(consumerDir, 'package.json'),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );

  run('npm', ['install', '--legacy-peer-deps'], {
    cwd: consumerDir,
    env: {
      ...process.env,
      npm_config_cache: join(consumerDir, '.npm-cache'),
    },
  });
  run('node', ['smoke-cjs.cjs'], { cwd: consumerDir });
  run('node', ['smoke-esm.mjs'], { cwd: consumerDir });
  run('node', ['node_modules/@module-federation/cli/bin/mf.js', '--help'], {
    cwd: consumerDir,
  });
  run('npm', ['run', 'typecheck'], { cwd: consumerDir });
  run('npm', ['run', 'build:webpack'], { cwd: consumerDir });
  run('npm', ['run', 'build:rspack'], { cwd: consumerDir });
  run('node', ['dist/webpack/main.js'], { cwd: consumerDir });
  run('node', ['dist/rspack/main.js'], { cwd: consumerDir });

  console.log(
    `[node20-compat] Installed and verified ${tarballs.length} package tarballs on Node.js ${process.versions.node}`,
  );
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
}

function run(command, args, options) {
  const { printOutput = true, ...spawnOptions } = options;
  const result = spawnSync(command, args, {
    ...spawnOptions,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(
      `Command failed: ${command} ${args.map((arg) => basename(arg)).join(' ')}`,
    );
  }

  if (printOutput && result.stdout) {
    process.stdout.write(result.stdout);
  }
  return result.stdout.trim();
}
