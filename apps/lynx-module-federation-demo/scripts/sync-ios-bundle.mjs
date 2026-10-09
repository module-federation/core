import assert from 'node:assert/strict';
import { cp, copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const source = path.resolve(
  appRoot,
  process.env.LYNX_IOS_HOST_BUNDLE ?? 'dist/host-native/main.lynx.bundle',
);
const destination = path.join(appRoot, 'ios/Resources/main.lynx.bundle');
const sourceLazyBundles = path.join(path.dirname(source), 'lazy-bundle');
const destinationHost = path.join(appRoot, 'ios/Resources/host-native');
const destinationLazyBundles = path.join(destinationHost, 'lazy-bundle');

const [sourceStat, sourceLazyBundlesStat] = await Promise.all([
  stat(source),
  stat(sourceLazyBundles),
]);
assert.ok(sourceStat.size > 0, `Native host bundle is empty: ${source}`);
assert.ok(
  sourceLazyBundlesStat.isDirectory(),
  `Native host lazy bundles are missing: ${sourceLazyBundles}`,
);
await mkdir(path.dirname(destination), { recursive: true });
await rm(destinationHost, { force: true, recursive: true });
await mkdir(destinationHost, { recursive: true });
await Promise.all([
  copyFile(source, destination),
  cp(sourceLazyBundles, destinationLazyBundles, { recursive: true }),
]);
process.stdout.write(
  `Copied ${source} and ${sourceLazyBundles} to iOS Resources.\n`,
);
