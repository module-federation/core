import assert from 'node:assert/strict';
import fs from 'node:fs';
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
