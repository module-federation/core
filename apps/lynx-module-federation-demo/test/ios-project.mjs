import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const read = (relativePath) =>
  readFile(path.join(appRoot, relativePath), 'utf8');

await Promise.all([
  access(path.join(appRoot, 'ios/OrbitControl.xcodeproj/project.pbxproj')),
  access(path.join(appRoot, 'ios/OrbitControl/AppDelegate.swift')),
  access(
    path.join(appRoot, 'ios/OrbitControlUITests/OrbitControlUITests.swift'),
  ),
]);

const [
  podfile,
  podfileLock,
  provenance,
  fetcher,
  releaseInfo,
  debugInfo,
  project,
  uiTest,
  appSource,
  packageJson,
  deviceServer,
] = await Promise.all([
  read('ios/Podfile'),
  read('ios/Podfile.lock'),
  read('ios/UPSTREAM.md'),
  read('ios/OrbitControl/OrbitResourceFetcher.m'),
  read('ios/OrbitControl/Info.plist'),
  read('ios/OrbitControl/Info.Debug.plist'),
  read('ios/OrbitControl.xcodeproj/project.pbxproj'),
  read('ios/OrbitControlUITests/OrbitControlUITests.swift'),
  read('src/app/App.tsx'),
  read('package.json'),
  read('scripts/dev-ios-device.mjs'),
]);

for (const pod of ['Lynx', 'LynxService', 'XElement']) {
  assert.match(podfile, new RegExp(`pod '${pod}', '3\\.9\\.0'`));
}
assert.match(podfile, /pod 'PrimJS', '3\.8\.0-alpha\.6'/);
assert.match(podfileLock, /Lynx \(3\.9\.0\)/);
assert.match(podfileLock, /PrimJS\/quickjs \(3\.8\.0-alpha\.6\)/);
assert.match(provenance, /integrating-lynx-demo-projects/);
assert.match(provenance, /f8230ca6aa1c9e629e30272971d0c03450b13e8e/);
assert.match(fetcher, /LynxBooleanOptionTrue/);
assert.match(fetcher, /builder\.templateResourceFetcher = self/);
assert.match(fetcher, /builder\.genericResourceFetcher = self/);
assert.match(fetcher, /isAllowedLocalURL/);
assert.match(fetcher, /resourcePathCache/);
assert.match(fetcher, /OrbitResourcePathCacheByteLimit/);
assert.match(fetcher, /OrbitResourceResponseByteLimit/);
assert.match(fetcher, /downloadTaskWithURL/);
assert.match(fetcher, /totalBytesWritten > .*OrbitResourceResponseByteLimit/);
assert.match(fetcher, /\[downloadTask cancel\]/);
assert.match(fetcher, /timeoutIntervalForResource = 60/);
assert.match(fetcher, /URLByResolvingSymlinksInPath/);
assert.doesNotMatch(releaseInfo, /NSAllowsArbitraryLoads/);
assert.doesNotMatch(releaseInfo, /NSExceptionAllowsInsecureHTTPLoads/);
assert.match(debugInfo, /NSAllowsLocalNetworking/);
assert.match(debugInfo, /<key>127\.0\.0\.1<\/key>/);
assert.match(debugInfo, /<key>localhost<\/key>/);
assert.doesNotMatch(debugInfo, /NSAllowsArbitraryLoads/);
assert.doesNotMatch(project, /DEVELOPMENT_TEAM/);
assert.match(project, /OrbitControlUITests/);
assert.match(uiTest, /matching\(identifier: "federation-ready"\)/);
assert.match(appSource, /accessibilityId: 'federation-ready'/);
assert.match(
  appSource,
  /ios-platform-accessibility-id=\{status\.accessibilityId\}/,
);
assert.match(uiTest, /testEmbeddedReleaseHostLaunches/);
assert.match(packageJson, /"ios:device": "node scripts\/dev-ios-device\.mjs"/);
assert.match(deviceServer, /LYNX_DEV_HOST: '0\.0\.0\.0'/);
assert.match(deviceServer, /not a loopback or unspecified address/);
const deviceServerPath = path.join(appRoot, 'scripts/dev-ios-device.mjs');
const validateDeviceOrigin = (origin) =>
  spawnSync(process.execPath, [deviceServerPath, '--check-origin'], {
    encoding: 'utf8',
    env: { ...process.env, LYNX_REMOTE_ORIGIN: origin },
  }).status;
assert.equal(validateDeviceOrigin('http://192.168.1.20:3000'), 0);
for (const origin of [
  'http://localhost:3000',
  'http://dev.localhost:3000',
  'http://127.42.0.1:3000',
  'http://0.0.0.0:3000',
  'http://[::1]:3000',
  'http://[::]:3000',
  'http://[::ffff:7f00:1]:3000',
  'https://192.168.1.20:3000',
  'http://192.168.1.20:3000/prefix',
  'http://192.168.1.20:3000?query=yes',
  'http://user:pass@192.168.1.20:3000',
]) {
  assert.notEqual(validateDeviceOrigin(origin), 0, origin);
}
process.stdout.write(
  'Standalone official Lynx iOS project policy validated.\n',
);
