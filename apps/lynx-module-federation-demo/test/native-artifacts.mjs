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
const nativeHostOrigin = process.env.LYNX_HOST_ORIGIN?.replace(/\/+$/, '');
const nativeHostAssetPrefix = nativeHostOrigin
  ? `${nativeHostOrigin}/host-native/`
  : '/host-native/';
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
  catalogLazyFiles,
  hostLazyFiles,
] = await Promise.all([
  stat(hostBundlePath),
  stat(standaloneBundlePath),
  stat(remoteBundlePath),
  readFile(remoteManifestPath, 'utf8'),
  readFile(remoteStatsPath, 'utf8'),
  readdir(path.join(appRoot, 'dist/remote-native')),
  readdir(path.join(appRoot, 'dist/remote-native/lazy-bundle')),
  readdir(path.join(appRoot, 'dist/catalog-native/lazy-bundle')),
  readdir(path.join(appRoot, 'dist/host-native/lazy-bundle'), {
    recursive: true,
  }),
]);

assert.ok(hostBundle.isFile() && hostBundle.size > 1_000, hostBundlePath);
assert.ok(
  standaloneBundle.isFile() && standaloneBundle.size > 1_000,
  standaloneBundlePath,
);
assert.ok(remoteBundle.isFile() && remoteBundle.size > 1_000, remoteBundlePath);
assert.ok(!remoteFiles.includes('bootstrap.lynx.bundle'));
assert.ok(!remoteFiles.includes('main.lynx.bundle'));
assert.equal(catalogLazyFiles.length, 1);
assert.ok(catalogLazyFiles[0].includes('activity-metadata'));
const remoteLazyBundles = lazyFiles.filter((name) => name.endsWith('.bundle'));
assert.equal(remoteLazyBundles.length, 4);
const nestedLazyBundle = remoteLazyBundles.find((name) =>
  name.includes('activity-metadata'),
);
assert.ok(nestedLazyBundle, 'nested activity lazy bundle is missing');
const hostLazyBundles = hostLazyFiles
  .filter((name) => name.endsWith('.bundle'))
  .map((name) => name.split(path.sep).join('/'));
assert.equal(hostLazyBundles.length, 2);
assert.ok(hostLazyBundles.some((name) => name.includes('staticCard.ts.')));
assert.ok(hostLazyBundles.some((name) => name.includes('federationState.ts.')));

const [hostBundleSource, standaloneSource, remoteBundleSource] =
  await Promise.all([
    readFile(hostBundlePath),
    readFile(standaloneBundlePath),
    readFile(remoteBundlePath),
  ]);
const hostTemplate = decodeTemplate(hostBundleSource);
const standaloneTemplate = decodeTemplate(standaloneSource);
const remoteTemplate = decodeTemplate(remoteBundleSource);
assert.equal(hostTemplate['engine-version'], '3.9');
assert.equal(standaloneTemplate['app-type'], 'card');
assert.equal(standaloneTemplate['engine-version'], '3.9');
assert.equal(remoteTemplate['app-type'], 'DynamicComponent');
assert.equal(remoteTemplate['engine-version'], '3.9');
assert.deepEqual(Object.keys(remoteTemplate['custom-sections']), ['catalog']);
const hostBackgroundSource = hostTemplate['background-thread-script']
  .map(({ content }) => content)
  .join('\n');
assert.ok(hostBackgroundSource.includes('mfAsyncStartup'));
assert.ok(hostBackgroundSource.includes('lynx_aci'));
assert.ok(hostBackgroundSource.includes('fetchBundle'));
assert.ok(hostBackgroundSource.includes(nativeHostAssetPrefix));
const reactLazyLoaderIndex = hostBackgroundSource.indexOf(
  'react-lynx-lazy-bundle-runtime-plugin',
);
const asyncStartupIndex = hostBackgroundSource.indexOf('mfAsyncStartup');
assert.ok(
  reactLazyLoaderIndex >= 0,
  'ReactLynx lazy loader is not bootstrapped',
);
assert.ok(
  reactLazyLoaderIndex < asyncStartupIndex,
  'ReactLynx lazy loader starts after federation async startup',
);

for (const name of hostLazyBundles) {
  const lazyTemplate = decodeTemplate(
    await readFile(path.join(appRoot, 'dist/host-native/lazy-bundle', name)),
  );
  assert.equal(lazyTemplate['app-type'], 'DynamicComponent', name);
  assert.equal(
    typeof lazyTemplate['custom-sections']?.background,
    'string',
    name,
  );
  assert.ok(
    !lazyTemplate['custom-sections'].background.includes(
      "tt.define('/app-service.js'",
    ),
    `${name} contains the app-service dispatcher instead of its executable chunk`,
  );
}

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
  const lazyPath = path.join(
    appRoot,
    'dist/remote-native/lazy-bundle',
    lazyName,
  );
  const lazyStat = await stat(lazyPath);
  assert.ok(lazyStat.isFile() && lazyStat.size > 1_000, lazyPath);
  const lazyTemplate = decodeTemplate(await readFile(lazyPath));
  assert.equal(lazyTemplate['app-type'], 'DynamicComponent', lazyName);
  assert.equal(
    typeof lazyTemplate['custom-sections']?.background,
    'string',
    `${lazyName} has no background section`,
  );
  assert.ok(
    !lazyTemplate['custom-sections'].background.includes(
      "tt.define('/app-service.js'",
    ),
    `${lazyName} contains the app-service dispatcher instead of its executable chunk`,
  );
  assert.ok(
    lazyTemplate['custom-sections']?.['main-thread']?.length > 100,
    `${lazyName} has no main-thread snapshot section`,
  );
  assert.ok(
    !JSON.stringify(exposed).includes('__main_thread'),
    `${exposed.name} contains a main-thread alias`,
  );
}

const nestedTemplate = decodeTemplate(
  await readFile(
    path.join(appRoot, 'dist/remote-native/lazy-bundle', nestedLazyBundle),
  ),
);
assert.equal(nestedTemplate['app-type'], 'DynamicComponent');
const nestedBackgroundSource =
  nestedTemplate['custom-sections']?.background ?? '';
assert.ok(
  nestedBackgroundSource.includes('Nested federated module ready'),
  `${nestedLazyBundle} does not contain the nested module`,
);

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
    server.waitFor(`/catalog-native/lazy-bundle/${catalogLazyFiles[0]}`),
    server.waitFor('/remote-native/mf-manifest.json'),
    server.waitFor('/remote-native/catalog.native.lynx.bundle'),
    ...hostLazyBundles.map((name) =>
      server.waitFor(`/host-native/lazy-bundle/${name}`),
    ),
    ...lazyFiles
      .filter((name) => name.endsWith('.bundle'))
      .map((name) => server.waitFor(`/remote-native/lazy-bundle/${name}`)),
  ]);
} finally {
  await server.close();
}

console.log(
  'Native Lynx host, standalone Catalog, and federation artifacts verified.',
);
