import { beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleInfo } from '@module-federation/sdk';

describe('resolved module factories', () => {
  beforeEach(() => resetFederationGlobalInfo());
  it.each(['service-first', 'component-first', 'concurrent'])(
    'preserves mixed exposes and successful load identity: %s',
    async (order) => {
      const service = Object.freeze({ default: () => ({ service: true }) });
      const component = { default: () => null };
      const get = rstest.fn(async () => () => component);
      const loadEntry = rstest.fn(() => ({ init() {}, get }));
      const onLoad = rstest.fn();
      const afterLoadRemote = rstest.fn();
      const errorLoadRemote = rstest.fn();
      const beforeExecuteFactory = rstest.fn();
      const afterExecuteFactory = rstest.fn();
      const instance = new ModuleFederation({
        name: `host-${order}`,
        inBrowser: false,
        shareStrategy: 'loaded-first',
        remotes: [
          {
            name: 'weather',
            alias: 'forecast',
            entry: 'https://weather.test/entry.js',
          },
        ],
        plugins: [
          {
            name: 'resolved-factory',
            afterResolve: (args) => ({
              ...args,
              remoteSnapshot: {
                version: 'v1',
                modules: [
                  {
                    modulePath: './App',
                    moduleName: 'App',
                    render: 'bridge',
                    servicePath: 'render/App',
                  },
                  {
                    modulePath: './Card',
                    moduleName: 'Card',
                    render: 'component',
                  },
                ],
              } as ModuleInfo,
            }),
            beforeLoadRemote: ({ expose, remoteSnapshot }) => {
              expect(remoteSnapshot?.version).toBe('v1');
              if (expose === './App') return { factory: () => service };
            },
            loadEntry,
            onLoad,
            afterLoadRemote,
            errorLoadRemote,
            beforeExecuteFactory,
            afterExecuteFactory,
          },
        ],
      });
      const app = () => instance.loadRemote('forecast/App');
      const card = () => instance.loadRemote('weather/Card');
      if (order === 'service-first') {
        expect(await app()).toBe(service);
        expect(loadEntry).not.toHaveBeenCalled();
        expect(await card()).toBe(component);
      } else if (order === 'component-first') {
        expect(await card()).toBe(component);
        expect(await app()).toBe(service);
      } else
        expect(await Promise.all([app(), card(), app()])).toEqual([
          service,
          component,
          service,
        ]);
      expect(await app()).toBe(service);
      const factory = await instance.loadRemote<() => typeof service>(
        'weather/App',
        { loadFactory: false },
      );
      expect(factory!()).toBe(service);
      const identity = instance.remoteHandler.getLoadedRemoteInfo(
        service.default,
      )!;
      expect(identity.recovered).toBe(false);
      expect(identity.isModule).toBe(false);
      expect(identity.remoteMatchInfo?.expose).toBe('./App');
      expect(instance.remoteHandler.idToRemoteMap['forecast/App']).toEqual({
        name: 'weather',
        expose: './App',
      });
      expect(get).toHaveBeenCalledTimes(1);
      expect(onLoad).toHaveBeenCalledTimes(afterLoadRemote.mock.calls.length);
      expect(errorLoadRemote).not.toHaveBeenCalled();
      expect(
        beforeExecuteFactory.mock.calls.some(
          ([event]) => event.expose === './App',
        ),
      ).toBe(true);
      expect(
        afterExecuteFactory.mock.calls.some(
          ([event]) =>
            event.expose === './App' && event.exposeModule === service,
        ),
      ).toBe(true);
      expect(beforeExecuteFactory).toHaveBeenCalledTimes(
        afterExecuteFactory.mock.calls.length,
      );
    },
  );
});

it.each(['serviceBaseUrl', 'servicePath'])(
  'keeps Service provenance unambiguous when a platform changes %s',
  async (field) => {
    resetFederationGlobalInfo();
    const service = { default: () => ({}) };
    let revision = 0;
    const instance = new ModuleFederation({
      name: 'service-identity',
      inBrowser: false,
      shareStrategy: 'loaded-first',
      remotes: [{ name: 'weather', entry: 'https://cdn.test/entry.js' }],
      plugins: [
        {
          name: 'selected-deployment',
          afterResolve: (args) => ({
            ...args,
            remoteSnapshot: {
              version: '1',
              buildVersion: '1',
              serviceBaseUrl:
                field === 'serviceBaseUrl'
                  ? `https://service-${revision}.test/`
                  : 'https://service.test/',
              modules: [
                {
                  moduleName: 'App',
                  modulePath: './App',
                  render: 'bridge',
                  servicePath:
                    field === 'servicePath' ? `render-${revision}` : 'render',
                },
              ],
            } as ModuleInfo,
          }),
          beforeLoadRemote: () => ({ factory: () => service }),
        },
      ],
    });
    await instance.loadRemote('weather/App');
    expect(instance.remoteHandler.getLoadedRemoteInfo(service)).toBeDefined();
    revision++;
    await instance.loadRemote('weather/App');
    expect(() => instance.remoteHandler.getLoadedRemoteInfo(service)).toThrow(
      'multiple expose or version identities',
    );
  },
);
