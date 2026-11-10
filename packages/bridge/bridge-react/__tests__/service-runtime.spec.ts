/** @jest-environment node */
import { createInstance, helpers } from '@module-federation/enhanced/runtime';
import bridgeServicePlugin from '../src/service/runtime-plugin.node';
import type { BridgeProviderInstance } from '../src/types';

beforeEach(() => helpers.global.resetFederationGlobalInfo());
it('loads only a reusable Service description, preserves deferred factories and never fetches a Node entry or SSR result', async () => {
  const requests = jest.spyOn(global, 'fetch');
  const entry = jest.fn(() => {
    throw Error('blocked Node entry');
  });
  const snapshot = {
    version: '1',
    buildVersion: 'build-1',
    modules: [
      {
        moduleName: 'App',
        modulePath: './App',
        render: 'bridge',
        isService: true,
      },
    ],
  } as any;
  const instance = createInstance({
    name: 'service-description',
    shareStrategy: 'loaded-first',
    remotes: [
      {
        name: 'weather',
        alias: 'forecast',
        entry: 'https://producer.test/entry.js',
      },
    ],
    plugins: [
      bridgeServicePlugin({
        'forecast/App': { url: 'https://service.test/render' },
      }),
      {
        name: 'resolved-service-fixture',
        loadSnapshot: (args) => ({ ...args, remoteSnapshot: snapshot }),
        afterResolve(args) {
          return {
            ...args,
            remoteSnapshot: snapshot,
          };
        },
        loadEntry: entry,
      },
    ],
  });
  try {
    await instance.preloadRemote([
      { nameOrAlias: 'forecast', exposes: ['App'] },
    ]);
    expect(entry).not.toHaveBeenCalled();
    const module = await instance.loadRemote<{
      default: () => BridgeProviderInstance;
    }>('forecast/App');
    const factory = await instance.loadRemote<() => typeof module>(
      'weather/App',
      { loadFactory: false },
    );
    expect(factory!()).toBe(module);
    expect((module as unknown as { __esModule: boolean }).__esModule).toBe(
      true,
    );
    expect(module!.default()).not.toBe(module!.default());
    expect(entry).not.toHaveBeenCalled();
    expect(requests).not.toHaveBeenCalled();
    requests.mockImplementation(async (_url, init) => {
      const body = JSON.parse(init!.body as string);
      expect(body.request.moduleName).toBe('forecast/App');
      return new Response(
        [
          {
            type: 'meta',
            protocol: 'module-federation/bridge-ssr/producer/v1',
            buildVersion: 'build-1',
            identifierPrefix: 'render-',
            hydration: 'progressive',
          },
          { type: 'html', html: '<p>weather</p>' },
          { type: 'ready', snapshot: {} },
          { type: 'done' },
        ]
          .map((frame) => JSON.stringify(frame) + '\n')
          .join(''),
        { headers: { 'content-type': 'application/x-ndjson' } },
      );
    });
    const result = await module!.default().renderStream!({
      moduleName: 'weather/App',
      instanceId: 'render',
      identifierPrefix: 'render-',
      url: 'https://host.test/service',
      props: {},
      signal: new AbortController().signal,
    });
    const reader = (
      result as import('../types').BridgeSSRMessageResult
    ).messages.getReader();
    while (!(await reader.read()).done) {}
    expect(requests).toHaveBeenCalledTimes(1);

    expect(
      instance.remoteHandler.getLoadedRemoteInfo(module!.default)
        ?.remoteMatchInfo?.expose,
    ).toBe('./App');
    await expect(instance.loadRemote('weather/Card')).rejects.toThrow(
      'blocked Node entry',
    );
    expect(entry).toHaveBeenCalledTimes(1);
  } finally {
    requests.mockRestore();
  }
});
it('rejects version-first before container discovery and leaves explicit configuration unchanged', () => {
  const options = {
    name: 'invalid-service',
    shareStrategy: 'version-first' as const,
    plugins: [
      bridgeServicePlugin({
        'weather/App': { url: 'https://service.test/render' },
      }),
    ],
  };
  expect(() => createInstance(options)).toThrow(
    'Service App requires loaded-first',
  );
  expect(options.shareStrategy).toBe('version-first');
});
