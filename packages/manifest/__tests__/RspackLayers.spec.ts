/** @jest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Stats as RspackStats } from '@rspack/core';
import type { Stats } from '@module-federation/sdk';
import type { Compilation, Compiler } from 'webpack';
import { ManifestManager } from '../src/ManifestManager';
import { StatsManager } from '../src/StatsManager';

// Load the ESM compiler with Node's loader instead of Jest's CommonJS loader.
const nativeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const { rspack } = nativeRequire(
  '@rspack/core',
) as typeof import('@rspack/core');

it('preserves native Rspack identities for the same source in two layers', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'mf-manifest-layers-'));
  const component = path.join(output, 'component.js');
  const shared = path.join(output, 'shared.js');
  const options = {
    name: 'layered',
    filename: 'remoteEntry.js',
    manifest: true,
    implementation: nativeRequire.resolve('@module-federation/runtime-tools', {
      paths: [path.dirname(nativeRequire.resolve('@rspack/core/package.json'))],
    }),
    exposes: {
      './Server': { import: component, name: 'server', layer: 'server' },
      './Client': { import: component, name: 'client', layer: 'client' },
    },
    shared: Object.fromEntries(
      ['server', 'client'].map((layer) => [
        layer,
        {
          request: 'shared-value',
          import: shared,
          shareKey: 'shared-value',
          layer,
          issuerLayer: layer,
          shareScope: [layer, 'default'],
          version: '1.0.0',
          requiredVersion: false as const,
        },
      ]),
    ),
  };
  try {
    await writeFile(component, 'export { default } from "shared-value";');
    await writeFile(shared, 'export default "shared";');
    const result = await new Promise<RspackStats>((resolve, reject) => {
      rspack(
        {
          context: output,
          mode: 'development',
          devtool: false,
          entry: {},
          experiments: { layers: true },
          output: { path: output, publicPath: '/' },
          plugins: [new rspack.container.ModuleFederationPlugin(options)],
        },
        (error, stats) => {
          if (error) reject(error);
          else if (!stats || stats.hasErrors())
            reject(new Error(stats?.toString()));
          else resolve(stats);
        },
      );
    });
    const compiler = result.compilation.compiler as unknown as Compiler;
    const nativeStats: Stats = JSON.parse(
      await readFile(path.join(output, 'mf-stats.json'), 'utf8'),
    );
    const manager = new StatsManager();
    manager.init(options, { pluginVersion: 'test', bundler: 'rspack' });
    const manifest = new ManifestManager().generateManifest({
      stats: manager.updateStats(nativeStats, compiler),
      compiler,
      compilation: result.compilation as unknown as Compilation,
      publicPath: '/',
      bundler: 'rspack',
    });
    expect(manifest.exposes).toHaveLength(2);
    for (const layer of ['server', 'client']) {
      const expose = manifest.exposes.find((item) => item.layer === layer);
      expect(expose).toMatchObject({
        requiredShared: [
          { name: 'shared-value', layer, shareScope: [layer, 'default'] },
        ],
      });
      expect(expose?.assets.js.sync.length).toBeGreaterThan(0);
      expect(manifest.shared).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'shared-value',
            layer,
            shareScope: [layer, 'default'],
          }),
        ]),
      );
    }
    expect(manifest.exposes[0].assets.js).not.toEqual(
      manifest.exposes[1].assets.js,
    );
    expect(
      new Set(manifest.shared.map((item) => item.identityId ?? item.id)).size,
    ).toBe(2);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
