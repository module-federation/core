import { remote } from '@module-federation/runtime-core/remote';
import { shared } from '@module-federation/runtime-core/shared';
import type {
  Capabilities,
  Platform,
} from '@module-federation/runtime-core/kernel';
import { createFederation } from '../src/compose';
import { remotes } from '../src/adapters/remotes';
import { consumes } from '../src/adapters/consumes';
import { shareScope } from '../src/adapters/share-scope';
import { container } from '../src/adapters/container';
import type { Adapter } from '../src/types';

let seq = 0;

const containerEntry = {
  init: () => undefined,
  get: () => () => ({ answer: 42 }),
};

const fakePlatform: Platform = {
  isBrowser: () => true,
  loadScript: () => Promise.resolve(),
  loadEntry: () => Promise.resolve(containerEntry as any),
};

function boot(
  capabilities: Capabilities,
  adapters: Adapter[],
  initOptions: Record<string, any> = {},
) {
  const name = `host${++seq}`;
  const federation = createFederation({
    buildId: `${name}:1.0.0`,
    capabilities,
    adapters,
  });
  const webpackRequire: any = (id: string) => {
    const module = { exports: {} };
    webpackRequire.m[id](module);
    return module.exports;
  };
  const initPromises = {};
  const initTokens = {};
  Object.assign(webpackRequire, {
    m: {},
    c: {},
    p: '',
    S: {},
    I: (shareScopeName: string, initScope?: unknown[]) =>
      federation.bundlerRuntime.I!({
        shareScopeName,
        webpackRequire,
        initPromises,
        initTokens,
        initScope: initScope as any,
      }),
    o: (obj: object, key: string | number) =>
      Object.prototype.hasOwnProperty.call(obj, key),
    federation,
  });
  federation.initOptions = { name, remotes: [], ...initOptions } as any;
  federation.instance = federation.bundlerRuntime.init({ webpackRequire });
  return { federation, webpackRequire, name };
}

async function loadRemoteModule(capabilities: Capabilities) {
  const { webpackRequire } = boot(capabilities, [remotes, shareScope], {
    remotes: [{ name: 'shop', entry: 'http://localhost/shop.js' }],
  });
  webpackRequire.m.external = (module: any) => {
    module.exports = {};
  };
  const promises: Promise<unknown>[] = [];
  webpackRequire.federation.bundlerRuntime.remotes({
    chunkId: 'main',
    promises,
    webpackRequire,
    chunkMapping: { main: ['button'] },
    idToExternalAndNameMapping: { button: ['default', './Button', 'external'] },
    idToRemoteMap: { button: [{ externalType: 'script', name: 'shop' }] },
  });
  await Promise.all(promises);
  return () => webpackRequire('button');
}

async function loadSharedModule(capabilities: Capabilities) {
  const { webpackRequire } = boot(capabilities, [consumes, shareScope], {
    shared: {
      react: {
        version: '18.0.0',
        scope: ['default'],
        get: () => () => ({ react: '18.0.0' }),
        shareConfig: { singleton: false, requiredVersion: '^18.0.0' },
      },
    },
  });
  const promises: Promise<unknown>[] = [];
  webpackRequire.federation.bundlerRuntime.consumes({
    chunkId: 'main',
    promises,
    webpackRequire,
    chunkMapping: { main: ['react-consume'] },
    installedModules: {},
    moduleToHandlerMapping: {
      'react-consume': {
        shareKey: 'react',
        getter: () => Promise.resolve(() => ({ react: 'fallback' })),
        shareInfo: {
          shareConfig: { singleton: false, requiredVersion: '^18.0.0' },
          scope: ['default'],
        },
      },
    },
  });
  await Promise.allSettled(promises);
  return () => webpackRequire('react-consume');
}

describe('createFederation', () => {
  test.each([
    ['remotes', remotes, ['remotes']],
    ['consumes', consumes, ['consumes', 'getSharedFallbackGetter']],
    ['share-scope', shareScope, ['I', 'installInitialConsumes']],
    ['container', container, ['initContainerEntry']],
  ])('%s exposes exactly its bundlerRuntime keys', (_, adapter, keys) => {
    const { bundlerRuntime } = createFederation({
      buildId: 'host:1.0.0',
      capabilities: {},
      adapters: [adapter],
    });
    expect(Object.keys(bundlerRuntime).sort()).toEqual(
      ['S', 'init', ...keys].sort(),
    );
  });

  test('without adapters exposes only the composer keys', () => {
    const federation = createFederation({
      buildId: 'host:1.0.0',
      capabilities: {},
      adapters: [],
    });
    expect(Object.keys(federation.bundlerRuntime).sort()).toEqual([
      'S',
      'init',
    ]);
    expect(Object.keys(federation.runtime)).toEqual(['loadScriptNode']);
    expect(federation).not.toHaveProperty('runtime.init');
  });

  test('init passes buildId as the default id', () => {
    const { federation, name } = boot({}, []);
    expect(federation.instance!.options.id).toBe(`${name}:1.0.0`);
  });

  test('init keeps an explicit id', () => {
    const { federation } = boot({}, [], { id: 'explicit' });
    expect(federation.instance!.options.id).toBe('explicit');
  });

  test('init runs each adapter beforeInit before the instance is created', () => {
    const seen: string[] = [];
    const probe: Adapter = {
      bundlerRuntime: {},
      beforeInit: (webpackRequire, initOptions) => {
        seen.push(initOptions.name);
        expect(webpackRequire.federation.instance).toBeUndefined();
      },
    };
    const { name } = boot({}, [probe]);
    expect(seen).toEqual([name]);
  });

  test('consumes beforeInit registers the tree-shaking share plugin', () => {
    const { federation } = boot({ shared }, [consumes, shareScope]);
    expect(
      federation.instance!.options.plugins.map((plugin) => plugin.name),
    ).toContain('tree-shake-plugin');
  });

  test('without consumes no tree-shaking share plugin is registered', () => {
    const { federation } = boot({ shared }, [shareScope]);
    expect(
      federation.instance!.options.plugins.map((plugin) => plugin.name),
    ).not.toContain('tree-shake-plugin');
  });

  test('runtime.loadScriptNode names the missing node platform', () => {
    const { federation } = boot({}, []);
    expect(() => federation.runtime.loadScriptNode('x.js', {})).toThrow(
      /loadScriptNode/,
    );
  });
});

describe('adapters against enabled and disabled handlers', () => {
  test('remotes loads a remote module with the remote capability', async () => {
    const load = await loadRemoteModule({ remote, platform: fakePlatform });
    expect(load()).toEqual({ answer: 42 });
  });

  test('remotes fails with the disabled remote error without it', async () => {
    const load = await loadRemoteModule({});
    expect(load).toThrow(/Remote loading is disabled/);
  });

  test('consumes resolves a shared module with the shared capability', async () => {
    const load = await loadSharedModule({ shared });
    expect(load()).toEqual({ react: '18.0.0' });
  });

  test('consumes fails with the disabled shared error without it', async () => {
    const load = await loadSharedModule({});
    expect(load).toThrow(/Shared dependency loading is disabled/);
  });

  test('share-scope initializes and exposes the share scope with the shared capability', async () => {
    const { webpackRequire } = boot({ shared }, [shareScope], {
      shared: {
        lodash: {
          version: '4.0.0',
          get: () => () => ({}),
          scope: ['default'],
          shareConfig: { singleton: false, requiredVersion: '^4.0.0' },
        },
      },
    });
    await webpackRequire.I('default');
    expect(Object.keys(webpackRequire.S.default)).toEqual(['lodash']);
  });

  test('share-scope initializes an empty scope without the shared capability', async () => {
    const { webpackRequire } = boot({}, [shareScope]);
    await expect(webpackRequire.I('default')).resolves.toBe(true);
    expect(webpackRequire.S).toEqual({});
  });

  test('share-scope installInitialConsumes fails with the disabled shared error without it', () => {
    const { webpackRequire } = boot({}, [shareScope]);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    webpackRequire.m.eager = () => undefined;
    expect(() =>
      webpackRequire.federation.bundlerRuntime.installInitialConsumes({
        webpackRequire,
        installedModules: {},
        initialConsumes: ['eager'],
        moduleToHandlerMapping: {
          eager: {
            shareKey: 'react',
            getter: () => Promise.resolve(() => ({})),
            shareInfo: { shareConfig: {}, scope: ['default'] },
          },
        },
      }),
    ).not.toThrow();
    expect(() => webpackRequire('eager')).toThrow(
      /Shared dependency loading is disabled/,
    );
  });

  test.each([
    ['with the shared capability', { shared }],
    ['without the shared capability', {}],
  ])(
    'container adopts the host share scope %s',
    async (_, capabilities: Capabilities) => {
      const { webpackRequire, federation } = boot(capabilities, [
        container,
        shareScope,
      ]);
      const hostScope = {};
      await federation.bundlerRuntime.initContainerEntry({
        webpackRequire,
        shareScope: hostScope,
        shareScopeKey: 'default',
      });
      expect(webpackRequire.S.default).toBe(hostScope);
    },
  );
});
