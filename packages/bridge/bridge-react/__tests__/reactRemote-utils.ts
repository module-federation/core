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
  const sources = new WeakMap<object, object>();
  const consume = async (id: string) => {
    try {
      const { remoteMatchInfo } = await getRemoteModuleAndOptions({ id });
      const value = await loadRemote(id);
      sources.set(value, {
        id,
        remoteMatchInfo,
        recovered: false,
        isModule: true,
      });
      return value;
    } catch (error) {
      const recovered = await errorLoadRemote({
        id,
        error,
        lifecycle: 'onLoad',
      });
      if (!recovered) throw error;
      sources.set(recovered, { id, recovered: true, isModule: true });
      return recovered;
    }
  };
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
    loadRemote: consume,
    moduleCache,
    remoteHandler: {
      idToRemoteMap,
      getRemoteModuleAndOptions,
      getLoadedRemoteInfo: (value: object) => sources.get(value),
      hooks: { lifecycle: { errorLoadRemote: { emit: errorLoadRemote } } },
    },
    snapshotHandler,
  } as unknown as ModuleFederation;
  return {
    instance,
    loadRemote,
    remote: () => consume('shop/Card'),
    metadata,
    snapshotHandler,
    errorLoadRemote,
    getRemoteModuleAndOptions,
  };
}
