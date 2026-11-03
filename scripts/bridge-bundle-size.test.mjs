import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { compareBridge, measureBridge } from './bridge-bundle-size.mjs';

const roots = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'bridge-size-'));
  roots.push(root);
  const directory = join(root, 'packages/bridge/bridge-react');
  await mkdir(join(directory, 'dist'), { recursive: true });
  await mkdir(join(directory, 'node_modules/tiny-runtime'), {
    recursive: true,
  });
  await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
  const manifest = {
    name: '@module-federation/bridge-react',
    exports: {
      './v18': {
        browser: { import: './dist/browser.mjs' },
        default: './dist/wrong.mjs',
      },
      './v19': { import: './dist/browser.mjs' },
    },
    dependencies: { 'tiny-runtime': '1.0.0' },
    peerDependencies: { react: '*' },
  };
  const saveManifest = () =>
    writeFile(join(directory, 'package.json'), JSON.stringify(manifest));
  await saveManifest();
  await writeFile(
    join(directory, 'dist/browser.mjs'),
    `
import React from 'react';
import { payload } from 'tiny-runtime';
export function createBridgeComponent() { return () => React.createElement('p', null, payload); }
`,
  );
  await writeFile(
    join(directory, 'node_modules/tiny-runtime/package.json'),
    JSON.stringify({
      name: 'tiny-runtime',
      type: 'module',
      exports: './index.js',
    }),
  );
  await writeFile(
    join(directory, 'node_modules/tiny-runtime/index.js'),
    'export const payload = "bundled runtime dependency";',
  );
  const git = (...args) =>
    execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' })
      .toString()
      .trim();
  git('init', '--quiet');
  git('add', '.');
  git(
    '-c',
    'user.name=Bridge size fixture',
    '-c',
    'user.email=bridge-size@example.test',
    'commit',
    '--quiet',
    '-m',
    'fixture',
  );
  return {
    root,
    directory,
    manifest,
    saveManifest,
    git,
    measure: () => measureBridge(join(root, 'packages')),
  };
}

test('measures reachable runtime dependencies, externalizes peers and records the exact revision', async () => {
  const live = await fixture();
  const result = await live.measure();
  const browser = result.fixtures['producer-v18'];
  assert.equal(result.revision, live.git('rev-parse', 'HEAD'));
  assert.equal(result.dirty, false);
  assert.match(result.lockfileSha256, /^[a-f0-9]{64}$/);
  assert.equal(browser.resolvedEntry, 'dist/browser.mjs');
  assert(browser.rawBytes > browser.minifiedBytes);
  assert(browser.gzipBytes > 0);
  assert(
    Object.keys(browser.inputs).some((name) =>
      name.includes('tiny-runtime/index.js'),
    ),
  );
  assert.deepEqual(browser.externalImports, ['react']);
  assert.equal(result.fixtures['producer-server'].status, 'unavailable');
  assert.equal(result.fixtures['receiver-html'].status, 'unavailable');
});

test('selects a Node export and reports a genuinely new SSR capability without a zero baseline', async () => {
  const live = await fixture();
  const base = await live.measure();
  live.manifest.exports['./server'] = {
    node: { import: './dist/node.mjs' },
    default: './dist/wrong.mjs',
  };
  await writeFile(
    join(live.directory, 'dist/node.mjs'),
    'export function createBridgeComponent() { return () => ({ renderStream() { return 42; } }); }',
  );
  await live.saveManifest();
  const current = await live.measure();
  assert.equal(
    current.fixtures['producer-server'].resolvedEntry,
    'dist/node.mjs',
  );
  const row = compareBridge(base, current)
    .split('\n')
    .find((line) => line.startsWith('| producer-server |'));
  assert.match(row, /New capability/);
  assert.match(row, /\| — \| \d[\d,]* B \| — \| — \|/);
  assert(!row.includes('Infinity'));
  assert.doesNotMatch(row, /\|\s*0 B\s*\|/);
  assert.match(compareBridge(undefined, current), /Not measured/);
});

test('a broken declared export fails instead of being mislabeled as an absent baseline', async () => {
  const live = await fixture();
  live.manifest.exports['./server'] = { import: './dist/missing.mjs' };
  await live.saveManifest();
  await assert.rejects(
    live.measure(),
    /Build the declared Bridge export first/,
  );
});

test('measures receiver HTML through the same Node ESM export without requiring a CommonJS entry', async () => {
  const live = await fixture();
  live.manifest.exports['./ssr-node'] = { node: { import: './dist/host.mjs' } };
  const html = '<script>window.receiver = true</script>';
  await writeFile(
    join(live.directory, 'dist/host.mjs'),
    `export function createBridgeSSRController() { return { getBootstrap: () => ${JSON.stringify(html)}, abort() {} }; }`,
  );
  await live.saveManifest();
  const result = await live.measure();
  const receiver = result.fixtures['receiver-html'];
  assert.equal(receiver.rawBytes, Buffer.byteLength(html));
  assert(receiver.gzipBytes > 0);
  assert.equal(receiver.minifiedBytes, undefined);
});

test('comparison retains real deltas and rejects mismatched toolchain settings', async () => {
  const live = await fixture();
  const base = await live.measure();
  const current = structuredClone(base);
  current.fixtures['producer-v18'].gzipBytes += 123;
  assert.match(compareBridge(base, current), /\+123 B/);
  current.config.target = 'es2022';
  assert.throws(() => compareBridge(base, current), /settings differ/);
});
