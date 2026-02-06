/* eslint-disable */
const path = require('path');

type RscRuntimeModule = typeof import('../rscRuntimePlugin');

function loadModule({ resetState }: { resetState: boolean }): RscRuntimeModule {
  if (resetState) {
    delete globalThis.__RSC_MF_RUNTIME_STATE__;
  }
  jest.resetModules();
  const modulePath = path.resolve(__dirname, '../rscRuntimePlugin.ts');
  delete require.cache[modulePath];
  return require(modulePath);
}

function loadFresh(): RscRuntimeModule {
  return loadModule({ resetState: true });
}

describe('rscRuntimePlugin helpers', () => {
  afterEach(() => {
    delete globalThis.__FEDERATION__;
    delete globalThis.__RSC_MF_RUNTIME_STATE__;
    jest.restoreAllMocks();
  });

  it('parseRemoteActionId parses remote action IDs', () => {
    const mod = loadFresh();
    expect(mod.parseRemoteActionId(null)).toBeNull();
    expect(mod.parseRemoteActionId('action:foo')).toBeNull();
    expect(mod.parseRemoteActionId('remote:')).toBeNull();
    expect(mod.parseRemoteActionId('remote:app2:')).toBeNull();
    expect(mod.parseRemoteActionId('remote:app2:abc')).toEqual({
      remoteName: 'app2',
      forwardedId: 'abc',
    });
  });

  it('formatRemoteRequest builds module requests', () => {
    const mod = loadFresh();
    expect(mod.formatRemoteRequest('', './x')).toBeNull();
    expect(mod.formatRemoteRequest('app2', '')).toBeNull();
    expect(mod.formatRemoteRequest('app2', '.')).toBe('app2');
    expect(mod.formatRemoteRequest('app2', './Button')).toBe('app2/Button');
    expect(mod.formatRemoteRequest('app2', '/Button')).toBe('app2/Button');
    expect(mod.formatRemoteRequest('app2', 'Button')).toBe('app2/Button');
  });

  it('getFederationInstance prefers origin instance when provided', () => {
    const mod = loadFresh();
    const origin = { options: { name: 'origin' } };
    expect(mod.getFederationInstance('ignored', origin)).toBe(origin);
  });

  it('getFederationInstance uses global instances', () => {
    const mod = loadFresh();
    globalThis.__FEDERATION__ = {
      __INSTANCES__: [
        { name: 'first', options: { remotes: [] } },
        { name: 'second', options: { remotes: [] } },
      ],
    };
    expect(mod.getFederationInstance('second', null)?.name).toBe('second');
    expect(mod.getFederationInstance(null, null)?.name).toBe('first');
  });

  it('getFederationRemotes normalizes remote definitions', () => {
    const mod = loadFresh();
    const origin = {
      options: {
        remotes: [
          { name: 'app2', entry: 'http://example.com/remoteEntry.js' },
          { alias: 'app3', entry: 'http://example.com/app3.js' },
          { name: 'bad', entry: null },
        ],
      },
    };
    const remotes = mod.getFederationRemotes(origin, null);
    expect(remotes).toHaveLength(2);
    expect(remotes[0]).toMatchObject({
      name: 'app2',
      entry: 'http://example.com/remoteEntry.js',
    });
    expect(remotes[1]).toMatchObject({
      name: 'app3',
      entry: 'http://example.com/app3.js',
    });
  });

  it('indexes remote action IDs with derived actions endpoint', () => {
    const mod = loadFresh();
    const remoteEntry = 'http://example.com/remoteEntry.server.js';
    mod.indexRemoteActionIds(
      remoteEntry,
      ['action:1', 'action:2'],
      { remote: { name: 'app2' } },
      null,
    );

    const indexed = mod.getIndexedRemoteAction('action:1');
    expect(indexed).toEqual({
      remoteName: 'app2',
      actionsEndpoint: 'http://example.com/react',
      remoteEntry,
      forwardedId: 'action:1',
    });
  });

  it('supports configurable actions path via rsc config', () => {
    const mod = loadFresh();
    const remoteEntry = 'http://example.com/remoteEntry.server.js';
    mod.indexRemoteActionIds(
      remoteEntry,
      ['action:1'],
      { remote: { name: 'app2' }, actionsEndpointPath: '/actions' },
      null,
    );

    const indexed = mod.getIndexedRemoteAction('action:1');
    expect(indexed).toEqual({
      remoteName: 'app2',
      actionsEndpoint: 'http://example.com/actions',
      remoteEntry,
      forwardedId: 'action:1',
    });
  });
});

describe('rscRuntimePlugin remote manifest loading', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete globalThis.__RSC_MF_RUNTIME_STATE__;
    jest.restoreAllMocks();
  });

  it('fetches and merges RSC config from manifest', async () => {
    const mod = loadFresh();
    const stats = {
      name: 'app2',
      rsc: {
        remote: {
          name: 'app2',
        },
      },
      additionalData: {
        rsc: {
          remote: {
            actionsEndpoint: 'http://example.com/react',
          },
        },
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => stats,
    });

    const config = await mod.getRemoteRSCConfig(
      'http://example.com/remoteEntry.server.js',
      null,
      null,
    );

    expect(config).toMatchObject({
      remote: {
        name: 'app2',
        actionsEndpoint: 'http://example.com/react',
      },
    });
  });

  it('fetches server actions manifest and indexes actions', async () => {
    const mod = loadFresh();
    const stats = {
      name: 'app2',
      rsc: {
        remote: {
          name: 'app2',
        },
        serverActionsManifest: 'react-server-actions-manifest.json',
      },
    };
    const actionsManifest = {
      actionId123: { id: 'actionId123', name: 'doThing' },
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => stats,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => actionsManifest,
      });

    const manifest = await mod.getRemoteServerActionsManifest(
      'http://example.com/remoteEntry.server.js',
      null,
      null,
    );

    expect(manifest).toEqual(actionsManifest);
    expect(mod.getIndexedRemoteAction('actionId123')).toMatchObject({
      remoteName: 'app2',
      actionsEndpoint: 'http://example.com/react',
      remoteEntry: 'http://example.com/remoteEntry.server.js',
    });
  });

  it('caches manifest metadata across module instances', async () => {
    const stats = {
      name: 'app2',
      rsc: { remote: { name: 'app2' } },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => stats,
    });

    const remoteEntry = 'http://example.com/remoteEntry.server.js';
    const first = loadFresh();
    const second = loadModule({ resetState: false });

    await first.getRemoteRSCConfig(remoteEntry, null, null);
    await second.getRemoteRSCConfig(remoteEntry, null, null);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('caches server actions manifest across module instances', async () => {
    const stats = {
      name: 'app2',
      rsc: {
        remote: { name: 'app2' },
        serverActionsManifest: 'react-server-actions-manifest.json',
      },
    };
    const actionsManifest = {
      actionId123: { id: 'actionId123', name: 'doThing' },
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => stats,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => actionsManifest,
      });

    const remoteEntry = 'http://example.com/remoteEntry.server.js';
    const first = loadFresh();
    const second = loadModule({ resetState: false });

    await first.getRemoteServerActionsManifest(remoteEntry, null, null);
    await second.getRemoteServerActionsManifest(remoteEntry, null, null);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
