import fs from 'fs';
import os from 'os';
import path from 'path';
import type { BuildResult } from 'esbuild';
import type { NormalizedFederationConfig } from '../../lib/config/federation-config';
import { writeRemoteManifest } from './manifest';

describe('writeRemoteManifest', () => {
  it('should resolve pluginVersion from package root package.json', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-manifest-test-'));
    const distDir = path.join(dir, 'dist');
    fs.mkdirSync(distDir, { recursive: true });

    const config: NormalizedFederationConfig = {
      name: 'mfe1',
      filename: 'remoteEntry.js',
      exposes: { './component': './src/Component.js' },
      remotes: {},
      shared: {},
    };

    const chunkPath = path.join(distDir, 'remoteEntry.js');
    const result = {
      errors: [],
      warnings: [],
      metafile: {
        inputs: {},
        outputs: {
          [chunkPath]: {
            bytes: 1,
            imports: [],
            exports: ['get', 'init'],
            entryPoint: 'mf-container:remoteEntry.js',
            inputs: {},
          },
        },
      },
    } as BuildResult;

    await writeRemoteManifest(config, result);

    const manifestPath = path.join(distDir, 'mf-manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const expectedVersion = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../../../package.json'),
        'utf-8',
      ),
    ).version;
    expect(manifest.metaData.pluginVersion).toBe(expectedVersion);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});
