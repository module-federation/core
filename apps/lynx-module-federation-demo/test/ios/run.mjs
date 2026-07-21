import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createArtifactServer } from '../support/artifact-server.mjs';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const distRoot = path.join(appRoot, 'dist');
const iosRoot = path.join(appRoot, 'ios');
const artifactsRoot = path.join(iosRoot, 'build');
const requestLogPath = path.join(artifactsRoot, 'requests.json');
const screenshotPath = path.join(artifactsRoot, 'orbit-control.png');
const resultBundlePath = path.join(
  artifactsRoot,
  'OrbitControl-Release.xcresult',
);

await mkdir(artifactsRoot, { recursive: true });
await rm(resultBundlePath, { force: true, recursive: true });
await stat(path.join(distRoot, 'host-native/main.lynx.bundle'));
await stat(path.join(distRoot, 'catalog-native/main.lynx.bundle'));
await stat(path.join(distRoot, 'remote-native/mf-manifest.json'));
const startupFiles = (
  await readdir(path.join(distRoot, 'host-native/static/js/async'))
).filter((file) => file.endsWith('.js'));
assert.ok(startupFiles.length > 0);
const manifest = JSON.parse(
  await readFile(path.join(distRoot, 'remote-native/mf-manifest.json'), 'utf8'),
);
const serverURL = new URL(
  manifest.metaData.publicPath === 'auto'
    ? 'http://127.0.0.1:3000/remote-native/'
    : manifest.metaData.publicPath,
);
assert.ok(
  serverURL.hostname === 'localhost' || serverURL.hostname === '127.0.0.1',
  `iOS E2E only serves local artifacts, received ${serverURL.origin}`,
);
const serverPort = Number(serverURL.port || 80);

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: iosRoot,
      env: process.env,
      stdio: 'inherit',
      ...options,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });

const simulatorList = spawnSync(
  'xcrun',
  ['simctl', 'list', 'devices', 'available', '-j'],
  { encoding: 'utf8' },
);
assert.equal(simulatorList.status, 0, simulatorList.stderr);
const devices = Object.entries(JSON.parse(simulatorList.stdout).devices)
  .reverse()
  .flatMap(([runtime, runtimeDevices]) =>
    runtimeDevices.map((device) => ({ ...device, runtime })),
  )
  .filter((device) => device.isAvailable && device.name.startsWith('iPhone'));
assert.ok(devices.length > 0, 'No available iPhone simulator was found.');
const templateDevice =
  devices.find(({ name }) => name.includes('16 Pro')) ?? devices[0];
assert.ok(
  templateDevice.deviceTypeIdentifier,
  `Simulator ${templateDevice.name} did not report a device type.`,
);

const artifactServer = await createArtifactServer({
  port: serverPort,
  root: distRoot,
  routes: {
    '/static/': path.join(distRoot, 'host-native/static'),
  },
});
const { requests } = artifactServer;
const requestedPaths = () =>
  requests.map(({ path: requestPath }) => requestPath);

let deviceUDID;
try {
  const created = spawnSync(
    'xcrun',
    [
      'simctl',
      'create',
      `OrbitControl E2E ${process.pid}`,
      templateDevice.deviceTypeIdentifier,
      templateDevice.runtime,
    ],
    { encoding: 'utf8' },
  );
  assert.equal(created.status, 0, created.stderr);
  deviceUDID = created.stdout.trim();
  assert.ok(deviceUDID, 'simctl create did not return a device identifier.');

  const boot = spawnSync('xcrun', ['simctl', 'boot', deviceUDID], {
    encoding: 'utf8',
  });
  assert.ok(
    boot.status === 0 || /current state: Booted/.test(boot.stderr),
    boot.stderr,
  );
  await run('xcrun', ['simctl', 'bootstatus', deviceUDID, '-b']);
  await run(
    'xcodebuild',
    [
      'test',
      '-workspace',
      'OrbitControl.xcworkspace',
      '-scheme',
      'OrbitControl',
      '-configuration',
      'Release',
      '-destination',
      `platform=iOS Simulator,id=${deviceUDID}`,
      '-derivedDataPath',
      'build/DerivedData',
      '-resultBundlePath',
      'build/OrbitControl-Release.xcresult',
      'COMPILER_INDEX_STORE_ENABLE=NO',
      '-parallel-testing-enabled',
      'NO',
      '-only-testing:OrbitControlTests',
      '-only-testing:OrbitControlUITests/OrbitControlUITests/testFederatedImportsRuntimeLoadingAndSingleton',
      '-only-testing:OrbitControlUITests/OrbitControlUITests/testStandaloneCatalogRemoteBuildLaunches',
      '-only-testing:OrbitControlUITests/OrbitControlUITests/testEmbeddedReleaseHostLaunches',
    ],
    {
      env: {
        ...process.env,
        CATALOG_BUNDLE_URL: `${serverURL.origin}/catalog-native/main.lynx.bundle`,
        LYNX_BUNDLE_URL: `${serverURL.origin}/host-native/main.lynx.bundle`,
      },
    },
  );

  const remoteEntry = manifest.metaData.remoteEntry;
  const expected = [
    '/host-native/main.lynx.bundle',
    '/catalog-native/main.lynx.bundle',
    ...startupFiles.map((file) => `/static/js/async/${file}`),
    '/remote-native/mf-manifest.json',
    new URL(`${remoteEntry.path}${remoteEntry.name}`, serverURL).pathname,
  ];
  const lazyFiles = (await readdir(path.join(distRoot, 'remote-native/async')))
    .filter((file) => file.endsWith('.bundle'))
    .map((file) => `/remote-native/async/${file}`);
  assert.equal(lazyFiles.length, 3);
  expected.push(...lazyFiles);
  for (const pathname of expected) {
    assert.ok(
      requestedPaths().includes(pathname),
      `iOS app did not request ${pathname}`,
    );
  }
  process.stdout.write(
    `Native iOS app launched Orbit and standalone Catalog, then loaded async startup, the manifest, container, and ${lazyFiles.length} lazy bundles.\n`,
  );
} finally {
  await writeFile(requestLogPath, JSON.stringify(requests, null, 2));
  if (deviceUDID) {
    spawnSync(
      'xcrun',
      ['simctl', 'io', deviceUDID, 'screenshot', screenshotPath],
      {
        encoding: 'utf8',
      },
    );
    spawnSync('xcrun', ['simctl', 'shutdown', deviceUDID], {
      encoding: 'utf8',
    });
    spawnSync('xcrun', ['simctl', 'delete', deviceUDID], {
      encoding: 'utf8',
    });
  }
  await artifactServer.close();
}
