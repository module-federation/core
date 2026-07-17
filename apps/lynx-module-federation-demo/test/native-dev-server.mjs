import assert from 'node:assert/strict';
import { mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const reservePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      assert.ok(address && typeof address === 'object');
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });

const port = await reservePort();
const origin = `http://127.0.0.1:${port}`;
const devEnvironment = {
  ...process.env,
  LYNX_DEV_HOST: '127.0.0.1',
  LYNX_DEV_PORT: String(port),
  LYNX_REMOTE_ORIGIN: origin,
};
const output = [];
const distRoot = path.join(appRoot, 'dist');
const backupRoot = await mkdtemp(path.join(appRoot, '.lynx-e2e-'));
const preservedDist = path.join(backupRoot, 'dist');
await rename(distRoot, preservedDist);
let child;

const fetchReady = async (url, timeout = 30_000) => {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `Native dev asset did not become available at ${url}: ${lastError}\n${output.join('')}`,
  );
};

const build = (config, label) => {
  const result = spawnSync(
    process.execPath,
    ['rspack-canary-rspeedy.mjs', 'build', '-c', config],
    { cwd: appRoot, encoding: 'utf8', env: devEnvironment },
  );
  assert.equal(
    result.status,
    0,
    `${label} failed:\n${result.stdout}\n${result.stderr}`,
  );
};

try {
  build('lynx.remote.native.config.mjs', 'Native remote rebuild');
  build('lynx.catalog.native.config.mjs', 'Native Catalog rebuild');
  child = spawn(
    process.execPath,
    ['rspack-canary-rspeedy.mjs', 'dev', '-c', 'lynx.config.mjs'],
    {
      cwd: appRoot,
      env: devEnvironment,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  child.stdout.on('data', (chunk) => output.push(chunk.toString()));
  child.stderr.on('data', (chunk) => output.push(chunk.toString()));

  await fetchReady(`${origin}/main.lynx.bundle`);
  await fetchReady(`${origin}/catalog-native/main.lynx.bundle`);
  const startupFiles = (
    await readdir(path.join(appRoot, 'dist/host-native/static/js/async'))
  ).filter((name) => name.endsWith('.js'));
  assert.ok(startupFiles.length > 0);
  await Promise.all(
    startupFiles.map((name) => fetchReady(`${origin}/static/js/async/${name}`)),
  );
  const manifestResponse = await fetchReady(
    `${origin}/remote-native/mf-manifest.json`,
  );
  const manifest = await manifestResponse.json();
  assert.equal(manifest.metaData.publicPath, `${origin}/remote-native/`);
  const remoteEntry = manifest.metaData.remoteEntry;
  const remoteBase =
    manifest.metaData.publicPath === 'auto'
      ? new URL('.', manifestResponse.url)
      : new URL(manifest.metaData.publicPath, manifestResponse.url);
  await fetchReady(
    new URL(`${remoteEntry.path}${remoteEntry.name}`, remoteBase),
  );

  const lazyFiles = await readdir(
    path.join(appRoot, 'dist/remote-native/async'),
  );
  const lazyBundles = lazyFiles.filter((name) => name.endsWith('.bundle'));
  assert.equal(lazyBundles.length, 3);
  await Promise.all(
    lazyBundles.map((name) =>
      fetchReady(`${origin}/remote-native/async/${name}`),
    ),
  );
  process.stdout.write(
    `Native Rspeedy dev server served host, async startup, standalone Catalog, manifest, container, and ${lazyBundles.length} lazy bundles.\n`,
  );
} finally {
  if (child) {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
  await rm(distRoot, { force: true, recursive: true });
  await rename(preservedDist, distRoot);
  await rm(backupRoot, { force: true, recursive: true });
}
