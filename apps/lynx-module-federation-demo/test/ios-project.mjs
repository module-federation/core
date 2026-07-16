import assert from 'node:assert/strict';
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
] = await Promise.all([
  read('ios/Podfile'),
  read('ios/Podfile.lock'),
  read('ios/UPSTREAM.md'),
  read('ios/OrbitControl/OrbitResourceFetcher.m'),
  read('ios/OrbitControl/Info.plist'),
  read('ios/OrbitControl/Info.Debug.plist'),
  read('ios/OrbitControl.xcodeproj/project.pbxproj'),
  read('ios/OrbitControlUITests/OrbitControlUITests.swift'),
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
assert.doesNotMatch(releaseInfo, /NSAllowsArbitraryLoads/);
assert.doesNotMatch(releaseInfo, /NSExceptionAllowsInsecureHTTPLoads/);
assert.match(debugInfo, /NSAllowsLocalNetworking/);
assert.match(debugInfo, /<key>127\.0\.0\.1<\/key>/);
assert.match(debugInfo, /<key>localhost<\/key>/);
assert.doesNotMatch(debugInfo, /NSAllowsArbitraryLoads/);
assert.doesNotMatch(project, /DEVELOPMENT_TEAM/);
assert.match(project, /OrbitControlUITests/);
assert.match(uiTest, /Shared singleton verified/);
process.stdout.write(
  'Standalone official Lynx iOS project policy validated.\n',
);
