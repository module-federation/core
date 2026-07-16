import assert from 'node:assert/strict';
import { copyFile, mkdir, stat } from 'node:fs/promises';
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

const sourceStat = await stat(source);
assert.ok(sourceStat.size > 0, `Native host bundle is empty: ${source}`);
await mkdir(path.dirname(destination), { recursive: true });
await copyFile(source, destination);
process.stdout.write(`Copied ${source} to ${destination}.\n`);
