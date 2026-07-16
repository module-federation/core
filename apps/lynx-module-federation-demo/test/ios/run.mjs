import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const distRoot = path.join(appRoot, 'dist');
const iosRoot = path.join(appRoot, 'ios');
const artifactsRoot = path.join(iosRoot, 'build');
const requestLogPath = path.join(artifactsRoot, 'requests.json');
const screenshotPath = path.join(artifactsRoot, 'orbit-control.png');
const resultBundlePath = path.join(artifactsRoot, 'OrbitControl.xcresult');
const releaseResultBundlePath = path.join(
  artifactsRoot,
  'OrbitControl-Release.xcresult',
);
const requestedPaths = [];

await mkdir(artifactsRoot, { recursive: true });
await rm(resultBundlePath, { force: true, recursive: true });
await rm(releaseResultBundlePath, { force: true, recursive: true });
await stat(path.join(distRoot, 'host-native/main.lynx.bundle'));
await stat(path.join(distRoot, 'remote-native/mf-manifest.json'));
const manifest = JSON.parse(
  await readFile(path.join(distRoot, 'remote-native/mf-manifest.json'), 'utf8'),
);
const serverURL = new URL(manifest.metaData.publicPath);
assert.ok(
  serverURL.hostname === 'localhost' || serverURL.hostname === '127.0.0.1',
  `iOS E2E only serves local artifacts, received ${serverURL.origin}`,
);
const serverPort = Number(serverURL.port || 80);

const contentTypes = new Map([
  ['.bundle', 'application/octet-stream'],
  ['.json', 'application/json; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    requestedPaths.push(pathname);
    const filePath = path.resolve(distRoot, `.${pathname}`);
    if (!filePath.startsWith(`${distRoot}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Length': fileStat.size,
      'Content-Type':
        contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

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

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(serverPort, '127.0.0.1', resolve);
});

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
      '-destination',
      `platform=iOS Simulator,id=${deviceUDID}`,
      '-derivedDataPath',
      'build/DerivedData',
      '-resultBundlePath',
      'build/OrbitControl.xcresult',
      '-parallel-testing-enabled',
      'NO',
    ],
    {
      env: {
        ...process.env,
        LYNX_BUNDLE_URL: `${serverURL.origin}/host-native/main.lynx.bundle`,
      },
    },
  );
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
      '-parallel-testing-enabled',
      'NO',
      '-only-testing:OrbitControlUITests/OrbitControlUITests/testEmbeddedReleaseHostLaunches',
    ],
    {
      env: {
        ...process.env,
        ORBIT_RELEASE_SMOKE: '1',
      },
    },
  );

  const remoteEntry = manifest.metaData.remoteEntry;
  const expected = [
    '/host-native/main.lynx.bundle',
    '/remote-native/mf-manifest.json',
    new URL(
      `${remoteEntry.path}${remoteEntry.name}`,
      manifest.metaData.publicPath,
    ).pathname,
  ];
  const lazyFiles = (await readdir(path.join(distRoot, 'remote-native/async')))
    .filter((file) => file.endsWith('.bundle'))
    .map((file) => `/remote-native/async/${file}`);
  assert.equal(lazyFiles.length, 3);
  expected.push(...lazyFiles);
  for (const pathname of expected) {
    assert.ok(
      requestedPaths.includes(pathname),
      `iOS app did not request ${pathname}`,
    );
  }
  process.stdout.write(
    `Native iOS app loaded the host, manifest, container, and ${lazyFiles.length} lazy bundles.\n`,
  );
} finally {
  await writeFile(requestLogPath, JSON.stringify(requestedPaths, null, 2));
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
  await new Promise((resolve) => server.close(resolve));
}
