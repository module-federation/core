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
const sourceStatic = path.join(path.dirname(source), 'static');
const destinationStatic = path.join(appRoot, 'ios/Resources/static');

const [sourceStat, sourceStaticStat] = await Promise.all([
  stat(source),
  stat(sourceStatic),
]);
assert.ok(sourceStat.size > 0, `Native host bundle is empty: ${source}`);
assert.ok(
  sourceStaticStat.isDirectory(),
  `Native host startup assets are missing: ${sourceStatic}`,
);
await mkdir(path.dirname(destination), { recursive: true });
await rm(destinationStatic, { force: true, recursive: true });
await Promise.all([
  copyFile(source, destination),
  cp(sourceStatic, destinationStatic, { recursive: true }),
]);
process.stdout.write(
  `Copied ${source} and ${sourceStatic} to iOS Resources.\n`,
);
