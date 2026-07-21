import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createArtifactServer } from './support/artifact-server.mjs';

const appRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requireFromAdapter = createRequire(
  path.join(appRoot, '../../packages/lynx/package.json'),
);
const nativeRemoteOrigin =
  process.env.LYNX_REMOTE_ORIGIN?.replace(/\/+$/, '') ??
  'http://127.0.0.1:3000';
const { decode_napi: decodeTemplate } = requireFromAdapter('@lynx-js/tasm');
const hostBundlePath = path.join(appRoot, 'dist/host-native/main.lynx.bundle');
const standaloneBundlePath = path.join(
  appRoot,
  'dist/catalog-native/main.lynx.bundle',
);
const remoteBundlePath = path.join(
  appRoot,
  'dist/remote-native/catalog.native.lynx.bundle',
);
const remoteManifestPath = path.join(
  appRoot,
  'dist/remote-native/mf-manifest.json',
);
const remoteStatsPath = path.join(appRoot, 'dist/remote-native/mf-stats.json');

const [
  hostBundle,
  standaloneBundle,
  remoteBundle,
  manifestSource,
  statsSource,
  remoteFiles,
  lazyFiles,
  startupFiles,
] = await Promise.all([
  stat(hostBundlePath),
  stat(standaloneBundlePath),
  stat(remoteBundlePath),
  readFile(remoteManifestPath, 'utf8'),
  readFile(remoteStatsPath, 'utf8'),
  readdir(path.join(appRoot, 'dist/remote-native')),
  readdir(path.join(appRoot, 'dist/remote-native/async')),
  readdir(path.join(appRoot, 'dist/host-native/static/js/async')),
]);

assert.ok(hostBundle.isFile() && hostBundle.size > 1_000, hostBundlePath);
assert.ok(
  standaloneBundle.isFile() && standaloneBundle.size > 1_000,
  standaloneBundlePath,
);
assert.ok(remoteBundle.isFile() && remoteBundle.size > 1_000, remoteBundlePath);
assert.ok(!remoteFiles.includes('bootstrap.lynx.bundle'));
assert.ok(!remoteFiles.includes('main.lynx.bundle'));
assert.equal(lazyFiles.filter((name) => name.endsWith('.bundle')).length, 3);
const startupScripts = startupFiles.filter((name) => name.endsWith('.js'));
assert.ok(startupScripts.length > 0);

const [hostBundleSource, standaloneSource, remoteBundleSource] =
  await Promise.all([
    readFile(hostBundlePath),
    readFile(standaloneBundlePath),
    readFile(remoteBundlePath),
  ]);
decodeTemplate(hostBundleSource);
const standaloneTemplate = decodeTemplate(standaloneSource);
const remoteTemplate = decodeTemplate(remoteBundleSource);
assert.equal(standaloneTemplate['app-type'], 'card');
assert.ok(standaloneSource.includes(Buffer.from('catalog-standalone-app')));
assert.equal(remoteTemplate['app-type'], 'DynamicComponent');
assert.equal(remoteTemplate['engine-version'], '3.7');
assert.deepEqual(Object.keys(remoteTemplate['custom-sections']), ['catalog']);

const manifest = JSON.parse(manifestSource);
const stats = JSON.parse(statsSource);
assert.equal(manifest.metaData?.name, 'catalog');
assert.equal(
  manifest.metaData?.publicPath,
  `${nativeRemoteOrigin}/remote-native/`,
);
assert.deepEqual(manifest.metaData?.remoteEntry, {
  name: 'catalog.native.lynx.bundle',
  path: '',
  type: 'lynx',
});

assert.ok(Array.isArray(manifest.exposes));
assert.deepEqual(manifest.exposes.map(({ name }) => name).sort(), [
  'ActivityFeed',
  'Card',
  'Details',
]);
assert.deepEqual(
  stats.exposes.map(({ name }) => name).sort(),
  manifest.exposes.map(({ name }) => name).sort(),
);
for (const exposed of manifest.exposes) {
  assert.equal(exposed.layer, 'react:background', exposed.name);
  assert.equal(exposed.path, `./${exposed.name}`);
  assert.deepEqual(exposed.assets?.js, { sync: [], async: [] });
  assert.deepEqual(exposed.assets?.css, { sync: [], async: [] });
  const lazyName = lazyFiles.find((name) =>
    name.startsWith(`catalog__background_${exposed.name}.`),
  );
  assert.ok(lazyName, `${exposed.name} lazy bundle is missing`);
  const lazyPath = path.join(appRoot, 'dist/remote-native/async', lazyName);
  const lazyStat = await stat(lazyPath);
  assert.ok(lazyStat.isFile() && lazyStat.size > 1_000, lazyPath);
  const lazyTemplate = decodeTemplate(await readFile(lazyPath));
  assert.equal(lazyTemplate['app-type'], 'DynamicComponent', lazyName);
  assert.ok(
    lazyTemplate['background-thread-script']?.length > 0,
    `${lazyName} has no background script`,
  );
  assert.ok(
    lazyTemplate['main-thread-script']?.lepus_code_len > 100,
    `${lazyName} has no main-thread snapshot bytecode`,
  );
  assert.ok(
    !JSON.stringify(exposed).includes('__main_thread'),
    `${exposed.name} contains a main-thread alias`,
  );
}

assert.ok(Array.isArray(manifest.shared));
assert.deepEqual(
  manifest.shared.map(({ name }) => name),
  ['orbit-shared-state'],
);
for (const shared of manifest.shared) {
  assert.equal(shared.layer, 'react:background', shared.name);
  assert.deepEqual(shared.shareScope, ['default:react:background']);
  assert.equal(shared.singleton, true, shared.name);
  assert.notEqual(shared.eager, true, shared.name);
}
assert.deepEqual(
  stats.shared.map(({ name }) => name),
  ['orbit-shared-state'],
);
assert.ok(
  manifest.exposes.some((exposed) =>
    exposed.requiredShared?.some(
      (shared) => shared.name === 'orbit-shared-state',
    ),
  ),
  'no expose records its shared-state dependency',
);

const server = await createArtifactServer({ root: path.join(appRoot, 'dist') });
try {
  await Promise.all([
    server.waitFor('/host-native/main.lynx.bundle'),
    server.waitFor('/catalog-native/main.lynx.bundle'),
    server.waitFor('/remote-native/mf-manifest.json'),
    server.waitFor('/remote-native/catalog.native.lynx.bundle'),
    ...startupScripts.map((name) =>
      server.waitFor(`/host-native/static/js/async/${name}`),
    ),
    ...lazyFiles
      .filter((name) => name.endsWith('.bundle'))
      .map((name) => server.waitFor(`/remote-native/async/${name}`)),
  ]);
} finally {
  await server.close();
}

console.log(
  'Native Lynx host, standalone Catalog, and federation artifacts verified.',
);
