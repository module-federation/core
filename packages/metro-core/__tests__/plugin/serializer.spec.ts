import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigError } from '../../src/utils/errors';

vi.mock('../../src/utils/metro-compat', () => {
  const baseJSBundle = vi.fn(() => ({ mocked: true }));

  return {
    CountingSet: class CountingSet<T> extends Set<T> {},
    baseJSBundle,
    bundleToString: vi.fn(() => ({ code: 'serialized-output' })),
  };
});

import { getModuleFederationSerializer } from '../../src/plugin/serializer';
import { baseJSBundle } from '../../src/utils/metro-compat';

function createSerializer(exposes: Record<string, string>) {
  return getModuleFederationSerializer(
    {
      name: 'MFExampleMini',
      filename: 'mini.bundle',
      remotes: {},
      exposes,
      shared: {},
      shareStrategy: 'loaded-first',
      plugins: [],
    },
    true,
  );
}

function createSerializerOptions(projectRoot = '/projectRoot') {
  return {
    runModule: false,
    modulesOnly: true,
    projectRoot,
  } as any;
}

function createGraph() {
  return {
    dependencies: new Map(),
  } as any;
}

describe('getModuleFederationSerializer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches expose paths when the entry path contains backslashes', async () => {
    const serializer = createSerializer({ './info': './src/info.tsx' });

    await expect(
      serializer(
        '/projectRoot/src\\info.tsx',
        [],
        createGraph(),
        createSerializerOptions(),
      ),
    ).resolves.toBe('serialized-output');
    expect(baseJSBundle).toHaveBeenCalledTimes(1);
  });

  it('matches expose paths without extension against resolved entry files', async () => {
    const serializer = createSerializer({ './info': './src/info' });

    await expect(
      serializer(
        '/projectRoot/src/info.tsx',
        [],
        createGraph(),
        createSerializerOptions(),
      ),
    ).resolves.toBe('serialized-output');
    expect(baseJSBundle).toHaveBeenCalledTimes(1);
  });

  it('prefers exact expose path match over extensionless fallback', async () => {
    const serializer = createSerializer({
      './js': './src/info.js',
      './tsx': './src/info.tsx',
    });

    await expect(
      serializer(
        '/projectRoot/src/info.tsx',
        [],
        createGraph(),
        createSerializerOptions(),
      ),
    ).resolves.toBe('serialized-output');
    expect(baseJSBundle).toHaveBeenCalledTimes(1);

    const preModules = vi.mocked(baseJSBundle).mock.calls[0][1] as any[];
    expect(preModules[0].output[0].data.code).toContain('["exposed/tsx"]');
    expect(preModules[1].output[0].data.code).toContain('["exposed/tsx"]');
  });

  it('throws a config error when no expose entry matches', async () => {
    const serializer = createSerializer({ './other': './src/other.tsx' });

    await expect(
      serializer(
        '/projectRoot/src/info.tsx',
        [],
        createGraph(),
        createSerializerOptions(),
      ),
    ).rejects.toBeInstanceOf(ConfigError);
  });
});
