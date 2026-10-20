import {
  describe,
  it,
  expect,
  rs,
  beforeAll,
  beforeEach,
  afterEach,
} from '@rstest/core';
import { mockStaticServer, removeScriptTags } from './mock/utils';

const BASE = 'http://localhost:1111/resources/load';

mockStaticServer({
  baseDir: __dirname,
  filterKeywords: [],
  basename: 'http://localhost:1111/',
});

type Core = typeof import('../src/core');
type Load = typeof import('../src/utils/load');
type Global = typeof import('../src/global');

let ModuleFederation: Core['ModuleFederation'];
let getRemoteEntry: Load['getRemoteEntry'];
let getRemoteInfo: Load['getRemoteInfo'];
let resetFederationGlobalInfo: Global['resetFederationGlobalInfo'];

describe('experiments.optimization.disableRemote', () => {
  beforeAll(async () => {
    (globalThis as any).FEDERATION_OPTIMIZE_NO_REMOTE = true;
    ({ ModuleFederation } = await import('../src/core'));
    ({ getRemoteEntry, getRemoteInfo } = await import('../src/utils/load'));
    ({ resetFederationGlobalInfo } = await import('../src/global'));
  });

  beforeEach(() => {
    resetFederationGlobalInfo();
    delete (globalThis as any)['remote'];
    removeScriptTags();
  });

  afterEach(() => {
    delete (globalThis as any)['remote'];
    removeScriptTags();
  });

  it('keeps remote loading disabled', async () => {
    const origin = new ModuleFederation({
      name: 'no-remote-host',
      remotes: [],
    });

    await expect(origin.loadRemote('remote/foo')).rejects.toThrow(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  });

  it('loads a shared fallback entry through the platform loader', async () => {
    const origin = new ModuleFederation({
      name: 'no-remote-host',
      remotes: [],
    });
    const remoteInfo = getRemoteInfo({
      name: 'remote',
      entry: `${BASE}/success.js`,
    });

    const entry = await getRemoteEntry({ origin, remoteInfo });

    expect(entry).toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
  });

  it('lets a runtime plugin resolve the entry through loadEntry', async () => {
    const container = { get: () => () => ({}), init: () => undefined };
    const origin = new ModuleFederation({
      name: 'no-remote-plugin-host',
      remotes: [],
      plugins: [{ name: 'custom-entry', loadEntry: () => container }],
    });
    const remoteInfo = getRemoteInfo({
      name: 'fallback',
      entry: 'https://remote.test/fallback.js',
    });

    await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toBe(
      container,
    );
  });

  it('resolves a shared fallback for its consumer with remotes disabled', async () => {
    const { getSharedFallbackGetter } =
      await import('../../webpack-bundler-runtime/src/getSharedFallbackGetter');
    const entry = {
      init: rs.fn(async () => undefined),
      get: rs.fn(() => () => ({ value: 'from-fallback' })),
    };
    const origin = new ModuleFederation({
      name: 'no-remote-shared-host',
      remotes: [],
      plugins: [{ name: 'shared-fallback-entry', loadEntry: () => entry }],
    });
    const bundlerRuntime = {};
    const webpackRequire = {
      p: `${BASE}/`,
      federation: {
        runtime: { getRemoteEntry },
        instance: origin,
        bundlerRuntime,
        sharedFallback: {
          'test-shared': [['fallback.js', '1.0.0', 'fallbackEntry', 'var']],
        },
      },
    } as unknown as Parameters<
      typeof getSharedFallbackGetter
    >[0]['webpackRequire'];

    const getter = getSharedFallbackGetter({
      shareKey: 'test-shared',
      version: '1.0.0',
      factory: () => () => ({ value: 'local' }),
      webpackRequire,
    });
    const factory = await getter();

    expect(factory()).toEqual({ value: 'from-fallback' });
    expect(entry.init).toHaveBeenCalledWith(origin, bundlerRuntime);
    expect(entry.get).toHaveBeenCalledTimes(1);
  });
});
