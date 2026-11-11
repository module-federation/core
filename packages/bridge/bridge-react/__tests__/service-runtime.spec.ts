/** @jest-environment node */
import { createInstance, helpers } from '@module-federation/enhanced/runtime';
import bridgeServicePlugin from '../src/service/runtime-plugin.node';
import {
  getBridgeService,
  getBridgeServiceIngress,
  registerBridgeServiceIngress,
} from '../src/service/config';
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
    serviceBaseUrl: 'https://service.test/',
    modules: [
      {
        moduleName: 'App',
        modulePath: './App',
        render: 'bridge',
        servicePath: 'render',
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
        'forecast/App': {
          forwardHeaders: ['accept-language'],
          serviceHeaders: { authorization: 'service-key' },
        },
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
      expect(body.request.headers).toEqual({ 'accept-language': 'zh' });
      expect(new Headers(init!.headers).get('authorization')).toBe(
        'service-key',
      );
      expect(new Headers(init!.headers).has('cookie')).toBe(false);
      expect(String(_url)).toBe('https://service.test/render');
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
      headers: { 'accept-language': 'zh', cookie: 'user-session' },
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
it('diagnoses Service sharing from supplied Snapshot without requiring Host policy and preserves ordinary version-first', async () => {
  const entry = jest.fn(() => ({
    init() {},
    get: async () => () => ({ default: 'ordinary' }),
  }));
  const snapshot = {
    version: '1',
    globalName: 'weather',
    remoteEntry: 'entry.js',
    publicPath: 'https://producer.test/',
    remoteEntryType: 'global',
    shared: [],
    remotesInfo: {},
    serviceBaseUrl: 'https://service.test/',
    modules: [
      {
        moduleName: 'App',
        modulePath: './App',
        servicePath: 'render',
        render: 'bridge',
      },
    ],
  } as any;
  const instance = createInstance({
    name: 'version-first-service',
    shareStrategy: 'version-first',
    remotes: [{ name: 'weather', version: 'current' }],
    plugins: [
      {
        name: 'supplied-snapshot',
        loadSnapshot: (args) => ({ ...args, remoteSnapshot: snapshot }),
        loadEntry: entry,
      },
      bridgeServicePlugin(),
    ],
  });
  await expect(
    Promise.all(instance.initializeSharing('default')),
  ).rejects.toThrow('Service App requires loaded-first');
  expect(entry).not.toHaveBeenCalled();
  expect(instance.options.shareStrategy).toBe('version-first');

  const ordinary = createInstance({
    name: 'version-first-ordinary',
    shareStrategy: 'version-first',
    remotes: [{ name: 'card', entry: 'https://ordinary.test/entry.js' }],
    plugins: [
      bridgeServicePlugin(),
      { name: 'entry-fixture', loadEntry: entry },
    ],
  });
  expect(await ordinary.loadRemote('card/Card')).toEqual({
    default: 'ordinary',
  });
  expect(entry).toHaveBeenCalledTimes(1);
});

function manifestFixture() {
  const assets = { js: { sync: [], async: [] }, css: { sync: [], async: [] } };
  return {
    id: 'weather',
    name: 'weather',
    metaData: {
      name: 'weather',
      globalName: 'weather',
      type: 'app',
      buildInfo: { buildVersion: 'build-1', buildName: 'weather' },
      publicPath: 'https://cdn.test/assets/',
      remoteEntry: { name: 'entry.js', path: '', type: 'global' },
      serviceBaseUrl: 'https://producer.test/application/',
    },
    shared: [],
    remotes: [],
    exposes: [
      {
        id: 'weather:App',
        name: 'App',
        path: './App',
        render: 'bridge',
        servicePath: 'services/App',
        assets,
      },
      {
        id: 'weather:Card',
        name: 'Card',
        path: './Card',
        render: 'component',
        assets,
      },
    ],
  };
}
function renderedResponse(prefix: string) {
  return new Response(
    [
      {
        type: 'meta',
        protocol: 'module-federation/bridge-ssr/producer/v1',
        buildVersion: 'build-1',
        identifierPrefix: prefix,
        hydration: 'progressive',
      },
      { type: 'html', html: '<p>weather</p>' },
      { type: 'ready', snapshot: {} },
      { type: 'done' },
    ]
      .map((frame) => JSON.stringify(frame) + '\n')
      .join(''),
    {
      headers: { 'content-type': 'application/x-ndjson' },
    },
  );
}
async function renderService(module: {
  default: () => BridgeProviderInstance;
}) {
  const result = (await module.default().renderStream!({
    moduleName: 'weather/App',
    instanceId: 'render',
    identifierPrefix: 'render-',
    url: 'https://host.test/page',
    props: {},
    headers: { cookie: 'host-user-session' },
    signal: new AbortController().signal,
  })) as import('../types').BridgeSSRMessageResult;
  const reader = result.messages.getReader();
  while (!(await reader.read()).done) {}
  reader.releaseLock();
}
it.each(['weather/App', 'forecast/App'])(
  'reads lazy private policies only for a resolved Service expose, keyed by %s',
  async (policyId) => {
    const resolveServices = jest.fn(() => ({
      [policyId]: {
        forwardHeaders: ['cookie'],
        serviceHeaders: { authorization: 'private-service-key' },
        timeoutMs: 15000,
      },
    }));
    const entry = jest.fn(() => ({
      init() {},
      get: () => () => ({ default: 'ordinary Card' }),
    }));
    const requests = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (url, init) => {
        if (String(url).endsWith('mf-manifest.json'))
          return new Response(JSON.stringify(manifestFixture()));
        expect(String(url)).toBe(
          'https://producer.test/application/services/App',
        );
        const body = JSON.parse(init!.body as string);
        expect(body.request.moduleName).toBe('forecast/App');
        expect(body.request.headers).toEqual({ cookie: 'host-user-session' });
        expect(new Headers(init!.headers).get('authorization')).toBe(
          'private-service-key',
        );
        return renderedResponse(body.request.identifierPrefix);
      });
    try {
      const plugin = bridgeServicePlugin(resolveServices);
      expect(resolveServices).not.toHaveBeenCalled();
      const instance = createInstance({
        name: `lazy-policy-${policyId}`,
        shareStrategy: 'loaded-first',
        remotes: [
          {
            name: 'weather',
            alias: 'forecast',
            entry: 'https://cdn.test/mf-manifest.json',
          },
        ],
        plugins: [plugin, { name: 'ordinary-container', loadEntry: entry }],
      });
      await Promise.all(instance.initializeSharing('default'));
      await instance.preloadRemote([
        { nameOrAlias: 'forecast', exposes: ['App'] },
      ]);
      expect(resolveServices).not.toHaveBeenCalled();
      expect(await instance.loadRemote('forecast/Card')).toEqual({
        default: 'ordinary Card',
      });
      expect(resolveServices).not.toHaveBeenCalled();

      const service = await instance.loadRemote<{
        default: () => BridgeProviderInstance;
      }>('weather/App');
      expect(resolveServices).toHaveBeenCalledTimes(1);
      expect(requests).toHaveBeenCalledTimes(1); // Only discovery, no HTTP render.
      expect(entry).toHaveBeenCalledTimes(1);
      await renderService(service!);
      expect(resolveServices).toHaveBeenCalledTimes(1);
      expect(await instance.loadRemote('weather/Card')).toEqual({
        default: 'ordinary Card',
      });
      expect(resolveServices).toHaveBeenCalledTimes(1);
      expect(entry).toHaveBeenCalledTimes(1);
    } finally {
      requests.mockRestore();
    }
  },
);
it('reports a missing private context only when consuming Service and leaves ordinary exposes usable', async () => {
  const resolveServices = jest.fn(() => {
    throw Error('Service runtime weather has no server configuration');
  });
  const requests = jest
    .spyOn(global, 'fetch')
    .mockImplementation(
      async () => new Response(JSON.stringify(manifestFixture())),
    );
  const entry = jest.fn(() => ({
    init() {},
    get: () => () => ({ default: 'ordinary Card' }),
  }));
  try {
    const instance = createInstance({
      name: 'missing-private-context',
      shareStrategy: 'loaded-first',
      remotes: [
        { name: 'weather', entry: 'https://cdn.test/mf-manifest.json' },
      ],
      plugins: [
        bridgeServicePlugin(resolveServices),
        { name: 'ordinary-container', loadEntry: entry },
      ],
    });
    expect(await instance.loadRemote('weather/Card')).toEqual({
      default: 'ordinary Card',
    });
    expect(resolveServices).not.toHaveBeenCalled();
    await expect(instance.loadRemote('weather/App')).rejects.toThrow(
      'Service runtime weather has no server configuration',
    );
    expect(resolveServices).toHaveBeenCalledTimes(1);
    expect(await instance.loadRemote('weather/Card')).toEqual({
      default: 'ordinary Card',
    });
    expect(entry).toHaveBeenCalledTimes(1);
    expect(requests).toHaveBeenCalledTimes(1);
  } finally {
    requests.mockRestore();
  }
});
it.each(['service-first', 'ordinary-first', 'concurrent'])(
  'discovers the manifest endpoint without Host policy and keeps mixed exposes independent: %s',
  async (order) => {
    const manifest = manifestFixture();
    const factory = jest.fn(() => ({ default: 'ordinary Card' }));
    const get = jest.fn((expose: string) => {
      expect(expose).toBe('./Card');
      return factory;
    });
    const entry = jest.fn(() => ({ init() {}, get }));
    const requests = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (url, init) => {
        if (String(url).endsWith('mf-manifest.json'))
          return new Response(JSON.stringify(manifest));
        expect(String(url)).toBe(
          'https://producer.test/application/services/App',
        );
        const body = JSON.parse(init!.body as string);
        expect(body.request.moduleName).toBe('forecast/App');
        expect(body.request.headers).toEqual({});
        return renderedResponse(body.request.identifierPrefix);
      });
    try {
      const instance = createInstance({
        name: `mixed-${order}`,
        shareStrategy: 'loaded-first',
        remotes: [
          {
            name: 'weather',
            alias: 'forecast',
            entry: 'https://cdn.test/mf-manifest.json',
          },
        ],
        plugins: [
          bridgeServicePlugin(),
          { name: 'ordinary-container', loadEntry: entry },
        ],
      });
      await instance.preloadRemote([
        { nameOrAlias: 'forecast', exposes: ['App'] },
      ]);
      expect(entry).not.toHaveBeenCalled();
      let service: any;
      if (order === 'service-first') {
        service = await instance.loadRemote('forecast/App');
        expect(entry).not.toHaveBeenCalled();
        await instance.loadRemote('forecast/Card');
      } else if (order === 'ordinary-first') {
        await instance.loadRemote('forecast/Card');
        service = await instance.loadRemote('forecast/App');
      } else {
        [service] = await Promise.all([
          instance.loadRemote('forecast/App'),
          instance.loadRemote('forecast/Card'),
        ]);
      }
      expect(await instance.loadRemote('weather/App')).toBe(service);
      const deferred = await instance.loadRemote<() => unknown>(
        'forecast/App',
        { loadFactory: false },
      );
      expect(deferred!()).toBe(service);
      expect(entry).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledTimes(1);
      expect(factory).toHaveBeenCalledTimes(1);
      expect(requests).toHaveBeenCalledTimes(1); // Discovery only, no SSR request yet.
      await renderService(service);
      expect(requests).toHaveBeenCalledTimes(2);
      expect(entry).toHaveBeenCalledTimes(1);
    } finally {
      requests.mockRestore();
    }
  },
);
it('uses a final platform-supplied Snapshot endpoint instead of the original manifest deployment', async () => {
  const manifest = manifestFixture();
  const entry = jest.fn(() => {
    throw Error('Node entry must not load');
  });
  const requests = jest
    .spyOn(global, 'fetch')
    .mockImplementation(async (url, init) => {
      if (String(url).endsWith('mf-manifest.json'))
        return new Response(JSON.stringify(manifest));
      expect(String(url)).toBe('https://platform.test/selected/render/App');
      return renderedResponse(
        JSON.parse(init!.body as string).request.identifierPrefix,
      );
    });
  try {
    const instance = createInstance({
      name: 'platform-selected',
      shareStrategy: 'loaded-first',
      remotes: [
        { name: 'weather', entry: 'https://cdn.test/mf-manifest.json' },
      ],
      plugins: [
        bridgeServicePlugin(),
        {
          name: 'platform-final-snapshot',
          loadRemoteSnapshot: (args) => ({
            ...args,
            remoteSnapshot: {
              ...args.remoteSnapshot,
              serviceBaseUrl: 'https://platform.test/selected/',
              modules: [
                {
                  ...manifest.exposes[0],
                  moduleName: 'App',
                  modulePath: './App',
                  servicePath: 'render/App',
                },
              ],
            },
          }),
          loadEntry: entry,
        },
      ],
    });
    const service = await instance.loadRemote<{
      default: () => BridgeProviderInstance;
    }>('weather/App');
    await renderService(service!);
    expect(entry).not.toHaveBeenCalled();
  } finally {
    requests.mockRestore();
  }
});
it.each([
  { serviceBaseUrl: undefined, servicePath: 'render/App' },
  { serviceBaseUrl: 'https://producer.test/', servicePath: undefined },
  { serviceBaseUrl: 'https://producer.test/', servicePath: '' },
  { serviceBaseUrl: 'https://producer.test/', servicePath: null },
  {
    serviceBaseUrl: 'https://producer.test/',
    servicePath: 'https://other.test/render',
  },
])(
  'rejects invalid supplied Service discovery before entry loading: %p',
  async ({ serviceBaseUrl, servicePath }) => {
    const entry = jest.fn();
    const instance = createInstance({
      name: `invalid-${String(servicePath)}`,
      shareStrategy: 'loaded-first',
      remotes: [{ name: 'weather', entry: 'https://producer.test/entry.js' }],
      plugins: [
        bridgeServicePlugin(),
        {
          name: 'direct-platform-snapshot',
          afterResolve: (args) => ({
            ...args,
            remoteSnapshot: {
              version: '1',
              buildVersion: 'build-1',
              serviceBaseUrl,
              modules: [
                {
                  moduleName: 'App',
                  modulePath: './App',
                  render: 'bridge',
                  servicePath,
                },
              ],
            } as any,
          }),
          loadEntry: entry,
        },
      ],
    });
    await expect(instance.loadRemote('weather/App')).rejects.toThrow(
      'Service App',
    );
    expect(entry).not.toHaveBeenCalled();
  },
);
it('diagnoses manifest-discovered Service in version-first sharing with no configured policy', async () => {
  const entry = jest.fn();
  const fetch = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(manifestFixture())));
  try {
    const instance = createInstance({
      name: 'manifest-version-first',
      shareStrategy: 'version-first',
      remotes: [
        { name: 'weather', entry: 'https://cdn.test/mf-manifest.json' },
      ],
      plugins: [
        bridgeServicePlugin(),
        { name: 'entry-counter', loadEntry: entry },
      ],
    });
    await expect(
      Promise.all(instance.initializeSharing('default')),
    ).rejects.toThrow('Service App requires loaded-first');
    expect(entry).not.toHaveBeenCalled();
  } finally {
    fetch.mockRestore();
  }
});

it.each([
  ['weather', 'forecast'],
  ['forecast', 'weather'],
])(
  'normalizes root expose %s with policy keyed by %s',
  async (requestId, policyId) => {
    const manifest = manifestFixture();
    manifest.exposes = [
      {
        ...manifest.exposes[0],
        id: 'weather:.',
        name: '.',
        path: '.',
        servicePath: 'services/root',
      },
    ];
    const entry = jest.fn(() => {
      throw Error('Root Service must not load Node entry');
    });
    const requests = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (url, init) => {
        if (String(url).endsWith('mf-manifest.json'))
          return new Response(JSON.stringify(manifest));
        expect(String(url)).toBe(
          'https://producer.test/application/services/root',
        );
        const body = JSON.parse(init!.body as string);
        expect(body.request.moduleName).toBe('forecast');
        expect(body.request.headers).toEqual({ cookie: 'host-user-session' });
        expect(new Headers(init!.headers).get('authorization')).toBe(
          'root-service-key',
        );
        return renderedResponse(body.request.identifierPrefix);
      });
    try {
      const instance = createInstance({
        name: `root-service-${requestId}`,
        shareStrategy: 'loaded-first',
        remotes: [
          {
            name: 'weather',
            alias: 'forecast',
            entry: 'https://cdn.test/mf-manifest.json',
          },
        ],
        plugins: [
          bridgeServicePlugin({
            [policyId]: {
              forwardHeaders: ['cookie'],
              serviceHeaders: { authorization: 'root-service-key' },
              timeoutMs: 15000,
            },
          }),
          { name: 'blocked-entry', loadEntry: entry },
        ],
      });
      const service = await instance.loadRemote<{
        default: () => BridgeProviderInstance;
      }>(requestId);
      expect(
        instance.remoteHandler.getLoadedRemoteInfo(service)?.remoteMatchInfo
          ?.expose,
      ).toBe('.');
      registerBridgeServiceIngress(instance, '/_modern/mf/service/');
      const policy = getBridgeService(instance, requestId);
      expect(policy.moduleName).toBe('forecast');
      expect(policy.timeoutMs).toBe(15000);
      expect(getBridgeServiceIngress(instance, policy.moduleName)).toBe(
        '/_modern/mf/service/forecast',
      );
      await renderService(service!);
      expect(entry).not.toHaveBeenCalled();
    } finally {
      requests.mockRestore();
    }
  },
);
