import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createManifestMiddleware } from '../../src/plugin/manifest-middleware';
import type { ModuleFederationConfigNormalized } from '../../src/types';

function createConfig(): ModuleFederationConfigNormalized {
  return {
    name: 'mini',
    filename: 'mini.bundle',
    remotes: {},
    exposes: {
      './info': './src/info.tsx',
    },
    shared: {
      lodash: {
        singleton: false,
        eager: false,
        version: '4.17.21',
      },
    },
    shareStrategy: 'loaded-first',
    plugins: [],
    dts: false,
  };
}

describe('createManifestMiddleware', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const tempDir of tempDirs) {
      fs.rmSync(tempDir, { force: true, recursive: true });
    }
    tempDirs.length = 0;
  });

  it('warms Metro dev bundle hashes before passing manifest requests through', async () => {
    const projectRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-metro-middleware-'),
    );
    tempDirs.push(projectRoot);

    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf-metro');
    const remoteEntryPath = path.join(tmpDirPath, 'mini.js');
    const sharedEntryPath = path.join(tmpDirPath, 'shared', 'lodash.js');
    const build = vi.fn(async () => ({ code: '', map: '' }));
    const middleware = vi.fn();
    const next = vi.fn();
    const vmManager = {
      registerVirtualModule: vi.fn(),
    };

    const enhanced = createManifestMiddleware({
      federationConfig: createConfig(),
      projectRoot,
      remoteEntryPath,
      tmpDirPath,
      vmManager,
    })(middleware as any, { build } as any);

    await enhanced(
      {
        url: '/mf-manifest.json?platform=ios&dev=true&lazy=true&minify=false&runModule=true&modulesOnly=false',
        headers: { host: 'localhost:8082' },
      } as any,
      {} as any,
      next,
    );

    expect(next).not.toHaveBeenCalled();
    expect(middleware).toHaveBeenCalledTimes(1);
    expect(build).toHaveBeenCalledTimes(3);
    expect(fs.existsSync(remoteEntryPath)).toBe(true);
    expect(fs.existsSync(sharedEntryPath)).toBe(true);
    expect(vmManager.registerVirtualModule).toHaveBeenCalledTimes(2);

    expect(build.mock.calls.map(([options]) => options.entryFile)).toEqual([
      './node_modules/.mf-metro/mini.js',
      './src/info.tsx',
      './node_modules/.mf-metro/shared/lodash.js',
    ]);
    expect(build.mock.calls.map(([options]) => options.sourceUrl)).toEqual([
      'http://localhost:8082/node_modules/.mf-metro/mini.bundle?platform=ios&dev=true&lazy=true&minify=false&runModule=true&modulesOnly=false',
      'http://localhost:8082/src/info.bundle?platform=ios&dev=true&lazy=true&minify=false&runModule=false&modulesOnly=true',
      'http://localhost:8082/node_modules/.mf-metro/shared/lodash.bundle?platform=ios&dev=true&lazy=true&minify=false&runModule=false&modulesOnly=true',
    ]);

    build.mockClear();
    middleware.mockClear();

    await enhanced(
      {
        url: '/mf-manifest.json',
        headers: { host: 'localhost:8082' },
      } as any,
      {} as any,
      next,
    );

    expect(build).not.toHaveBeenCalled();
    expect(middleware).toHaveBeenCalledTimes(1);
  });
});
