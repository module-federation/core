import type { ModuleFederation } from '@module-federation/enhanced/runtime';

export function remoteRuntime(
  module: Record<string, unknown>,
  render?: 'component' | 'bridge',
  isService = false,
) {
  const metadata = {
    moduleName: 'Card',
    modulePath: './Card',
    assets: { js: { sync: [], async: [] }, css: { sync: [], async: [] } },
    ...(render && { render }),
    isService,
  };
  const snapshot = {
    modules: [metadata],
    publicPath: '',
    remoteEntry: '',
    version: '1',
  };
  const moduleCache = new Map();
  const idToRemoteMap: Record<string, { name: string; expose: string }> = {};
  const loadRemote = jest.fn(async (id: string) => {
    idToRemoteMap[id] = { name: 'shop', expose: './Card' };
    moduleCache.set('shop', {
      remoteInfo: {
        name: 'shop',
        alias: 'alias',
        entryGlobalName: 'shop',
        entry: 'https://example.test/entry.js',
      },
    });
    return module;
  });
  const snapshotHandler = {
    loadRemoteSnapshotInfo: jest.fn(async () => ({ remoteSnapshot: snapshot })),
    getGlobalRemoteInfo: jest.fn(() => ({ remoteSnapshot: snapshot })),
  };
  const errorLoadRemote = jest.fn();
  const getRemoteModuleAndOptions = jest.fn(async ({ id }: { id: string }) => ({
    remoteMatchInfo: {
      id,
      expose: './Card',
      remoteSnapshot: (await snapshotHandler.loadRemoteSnapshotInfo())
        .remoteSnapshot,
    },
  }));
  const loadResolvedRemote = jest.fn(async (id, _options, resolvedRemote) => {
    try {
      await resolvedRemote;
      return await loadRemote(id);
    } catch (error) {
      const recovered = await errorLoadRemote({
        id,
        error,
        lifecycle: 'onLoad',
      });
      if (!recovered) throw error;
      return recovered;
    }
  });
  const instance = {
    name: 'host',
    options: {
      name: 'host',
      version: '1',
      remotes: [
        {
          name: 'shop',
          alias: 'alias',
          entry: 'https://example.test/mf-manifest.json',
        },
      ],
    },
    registerPlugins: jest.fn(),
    loadRemote,
    moduleCache,
    remoteHandler: {
      idToRemoteMap,
      getRemoteModuleAndOptions,
      loadRemote: loadResolvedRemote,
      hooks: { lifecycle: { errorLoadRemote: { emit: errorLoadRemote } } },
    },
    snapshotHandler,
  } as unknown as ModuleFederation;
  return {
    instance,
    loadRemote,
    metadata,
    snapshotHandler,
    errorLoadRemote,
    getRemoteModuleAndOptions,
    loadResolvedRemote,
  };
}
