import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';
import { moduleFederationPlugin } from '../dist/plugin.mjs';

// esbuild reports metafile paths relative to absWorkingDir. The plugin used to
// resolve them, and the shared package versions, from process.cwd() instead.
test('a build whose absWorkingDir is not the process directory', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-esbuild-'));
  assert.notEqual(path.resolve(root), process.cwd());
  fs.writeFileSync(path.join(root, 'entry.js'), 'export const host = true;\n');
  fs.writeFileSync(path.join(root, 'value.js'), 'export const value = 42;\n');
  const dep = path.join(root, 'node_modules', 'dep');
  fs.mkdirSync(dep, { recursive: true });
  fs.writeFileSync(
    path.join(dep, 'package.json'),
    JSON.stringify({ name: 'dep', version: '1.2.3', main: 'index.js' }),
  );
  fs.writeFileSync(path.join(dep, 'index.js'), 'module.exports = {};\n');

  // Where the bug wrote the manifest.
  const strayManifest = path.resolve(process.cwd(), 'dist', 'mf-manifest.json');
  fs.rmSync(strayManifest, { force: true });

  try {
    await build({
      absWorkingDir: root,
      bundle: true,
      entryPoints: ['entry.js'],
      external: [
        '@module-federation/error-codes',
        '@module-federation/runtime',
        '@module-federation/sdk',
        '@module-federation/webpack-bundler-runtime',
      ],
      format: 'esm',
      metafile: true,
      outdir: 'dist',
      plugins: [
        moduleFederationPlugin({
          name: 'esbuild_abs_working_dir_test',
          filename: 'remoteEntry.js',
          exposes: { './value': './value.js' },
          remotes: {},
          shared: { dep: {} },
        }),
      ],
    });

    const remoteEntry = fs.readFileSync(
      path.join(root, 'dist', 'remoteEntry.js'),
      'utf-8',
    );
    assert.equal(remoteEntry.includes('__MODULE_MAP__'), false);
    assert.equal(remoteEntry.includes('"./value"'), true);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'dist', 'mf-manifest.json'), 'utf-8'),
    );
    assert.equal(manifest.metaData.remoteEntry.name, 'remoteEntry.js');
    assert.deepEqual(
      manifest.shared.map((s) => [s.name, s.version]),
      [['dep', '1.2.3']],
    );
    assert.equal(fs.existsSync(strayManifest), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
