import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requireFromAdapter = createRequire(
  path.join(appRoot, '../../packages/lynx/package.json'),
);
const { decode_napi: decodeTemplate } = requireFromAdapter('@lynx-js/tasm');
const hostBundlePath = path.join(appRoot, 'dist/host-native/main.lynx.bundle');
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
  remoteBundle,
  manifestSource,
  statsSource,
  remoteFiles,
  lazyFiles,
] = await Promise.all([
  stat(hostBundlePath),
  stat(remoteBundlePath),
  readFile(remoteManifestPath, 'utf8'),
  readFile(remoteStatsPath, 'utf8'),
  readdir(path.join(appRoot, 'dist/remote-native')),
  readdir(path.join(appRoot, 'dist/remote-native/async')),
]);

assert.ok(hostBundle.isFile() && hostBundle.size > 1_000, hostBundlePath);
assert.ok(remoteBundle.isFile() && remoteBundle.size > 1_000, remoteBundlePath);
assert.ok(!remoteFiles.includes('bootstrap.lynx.bundle'));
assert.equal(lazyFiles.filter((name) => name.endsWith('.bundle')).length, 3);

const [hostTemplate, remoteTemplate] = await Promise.all([
  readFile(hostBundlePath).then(decodeTemplate),
  readFile(remoteBundlePath).then(decodeTemplate),
]);
assert.equal(remoteTemplate['app-type'], 'DynamicComponent');
assert.equal(remoteTemplate['engine-version'], '3.7');
assert.deepEqual(Object.keys(remoteTemplate['custom-sections']), ['catalog']);
const containerSource = remoteTemplate['custom-sections'].catalog;
assert.match(containerSource, /lynx_chunking/);
assert.match(containerSource, /split/);
for (const implementationText of [
  'Increment from remote',
  'Federated activity',
  'Realm status',
]) {
  assert.ok(
    !containerSource.includes(implementationText),
    `split container includes exposed implementation: ${implementationText}`,
  );
}

const hostSource = JSON.stringify(hostTemplate);
assert.match(
  hostSource,
  /http:\/\/127\.0\.0\.1:3000\/remote-native\/mf-manifest\.json/,
);
assert.match(hostSource, /lynx-federation-runtime-plugin/);
for (const request of [
  'catalog/ActivityFeed',
  'catalog/Card',
  'catalog/Details',
]) {
  assert.ok(hostSource.includes(request), `host omits ${request}`);
}

const manifest = JSON.parse(manifestSource);
const stats = JSON.parse(statsSource);
assert.equal(manifest.metaData?.name, 'catalog');
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
  const mainThreadBytecode = Buffer.from(
    lazyTemplate['main-thread-script'].lepus_code,
  );
  assert.ok(
    mainThreadBytecode.includes(Buffer.from('react__main-thread')),
    `${lazyName} does not use the ReactLynx main-thread chunk contract`,
  );
  for (const backgroundWrapperMarker of [
    'bundleSupportLoadScript',
    '__bundle__holder',
  ]) {
    assert.ok(
      !mainThreadBytecode.includes(Buffer.from(backgroundWrapperMarker)),
      `${lazyName} main-thread bytecode contains the background runtime wrapper marker ${backgroundWrapperMarker}`,
    );
  }
  const entryScript = lazyTemplate['background-thread-script'].find(
    ({ content }) => content?.includes('__lynx_dynamic_component_entry__'),
  );
  assert.ok(
    entryScript,
    `${lazyName} does not preserve its DynamicComponent entry identity`,
  );
  assert.ok(
    entryScript.content.lastIndexOf('__lynx_dynamic_component_entry__') <
      entryScript.content.lastIndexOf('.require('),
    `${lazyName} writes its DynamicComponent entry identity outside the Lynx module wrapper`,
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

console.log('Native Lynx host and federation remote artifacts verified.');
