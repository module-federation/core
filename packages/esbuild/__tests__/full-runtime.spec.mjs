import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';
import { moduleFederationPlugin } from '../dist/plugin.mjs';

const packageDir = path.resolve(import.meta.dirname, '..');

test('the public plugin bundles the full default runtime', async () => {
  const root = fs.mkdtempSync(path.join(packageDir, '.mf-esbuild-runtime-'));
  fs.writeFileSync(path.join(root, 'entry.js'), 'export const host = true;\n');
  fs.writeFileSync(path.join(root, 'value.js'), 'export const value = 42;\n');

  try {
    const result = await build({
      absWorkingDir: root,
      bundle: true,
      entryPoints: ['entry.js'],
      external: [
        '@module-federation/error-codes',
        '@module-federation/runtime',
        '@module-federation/sdk',
      ],
      format: 'esm',
      metafile: true,
      outdir: 'dist',
      plugins: [
        moduleFederationPlugin({
          name: 'esbuild_runtime_test',
          filename: 'remoteEntry.js',
          exposes: { './value': './value.js' },
          remotes: {},
          shared: {},
        }),
      ],
    });
    const inputs = Object.keys(result.metafile.inputs);

    assert(
      inputs.some((input) =>
        input.endsWith('/webpack-bundler-runtime/dist/index.js'),
      ),
      'the public plugin did not include the bundler runtime',
    );
    assert(
      inputs.some((input) => input.endsWith('/dist/initContainerEntry.js')),
      'the full runtime omitted container initialization',
    );
    assert(
      inputs.some((input) => input.endsWith('/dist/remotes.js')),
      'the full runtime omitted remote loading',
    );
    assert(
      inputs.some((input) => input.endsWith('/dist/consumes.js')),
      'the full runtime omitted shared consumption',
    );
    const remoteOutput = Object.keys(result.metafile.outputs).find(
      (output) => path.basename(output) === 'remoteEntry.js',
    );
    assert.equal(
      remoteOutput ? path.basename(path.dirname(remoteOutput)) : '',
      'dist',
      'the plugin did not emit the configured remote entry',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('the plugin rewrites the module map and writes the manifest under absWorkingDir', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-esbuild-manifest-'));
  fs.writeFileSync(path.join(root, 'entry.js'), 'export const host = true;\n');
  fs.writeFileSync(path.join(root, 'value.js'), 'export const value = 42;\n');

  const strayManifest = path.join(packageDir, 'dist', 'mf-manifest.json');
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
          name: 'esbuild_manifest_test',
          filename: 'remoteEntry.js',
          exposes: { './value': './value.js' },
          remotes: {},
          shared: {},
        }),
      ],
    });

    const remoteEntry = fs.readFileSync(
      path.join(root, 'dist', 'remoteEntry.js'),
      'utf-8',
    );
    assert(
      !remoteEntry.includes('__MODULE_MAP__'),
      'remoteEntry.js still contains the unresolved module map placeholder',
    );

    const manifestPath = path.join(root, 'dist', 'mf-manifest.json');
    assert(
      fs.existsSync(manifestPath),
      'mf-manifest.json was not written under absWorkingDir',
    );

    assert(
      !fs.existsSync(strayManifest),
      'mf-manifest.json leaked into the package directory instead of absWorkingDir',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(strayManifest, { force: true });
  }
});
