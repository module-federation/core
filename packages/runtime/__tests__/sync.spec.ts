import { describe, it, expect, beforeAll, afterAll, assert } from 'vitest';
import { matchRemoteWithNameAndExpose } from '@module-federation/runtime-core';
import {
  addGlobalSnapshot,
  getGlobalSnapshot,
  Global,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';

import { requestList } from './mock/env';

// Helper function to check if a method is private
function isPrivate(methodName: string): boolean {
  return methodName.startsWith('_');
}

describe('Embed Module Proxy', async () => {
  // Dynamically import the index module
  const Index = await import('../src/index');

  beforeAll(async () => {
    // Mock the global __webpack_require__ to provide the runtime
    //@ts-ignore
    globalThis.__webpack_require__ = {
      federation: {
        runtime: Index,
      },
    };
  });

  afterAll(async () => {
    // Clean up the global __webpack_require__ mock
    //@ts-ignore
    delete globalThis.__webpack_require__;
  });

  // Dynamically import the embedded module
  const Embedded = await import('../src/embedded');
  describe('Api Sync', () => {
    it('should have the same exports in embedded.ts and index.ts', () => {
      // Compare the exports of embedded.ts and index.ts
      const embeddedExports = Object.keys(Embedded).sort();
      const indexExports = Object.keys(Index).sort();
      expect(embeddedExports).toEqual(indexExports);
    });

    it('FederationHost class should have the same methods in embedded.ts and index.ts', () => {
      // Create instances of FederationHost from both embedded.ts and index.ts
      const embeddedHost = new Embedded.FederationHost({
        name: '@federation/test',
        remotes: [],
      });
      const indexHost = new Index.FederationHost({
        name: '@federation/test',
        remotes: [],
      });

      // Get the method names of FederationHost instances, excluding private methods
      const embeddedMethods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(embeddedHost),
      )
        .filter(
          (prop) =>
            typeof embeddedHost[prop] === 'function' && !isPrivate(prop),
        )
        .sort();
      const indexMethods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(indexHost),
      )
        .filter(
          (prop) => typeof indexHost[prop] === 'function' && !isPrivate(prop),
        )
        .sort();

      // Compare the method names
      expect(embeddedMethods).toEqual(indexMethods);
    });

    it('Module class should have the same methods in embedded.ts and index.ts', () => {
      // Create instances of Module from both embedded.ts and index.ts
      const embeddedModule = new Embedded.Module({
        remoteInfo: {
          name: '@federation/test',
          entry: '',
          type: '',
          entryGlobalName: '',
          shareScope: '',
        },
        host: new Embedded.FederationHost({
          name: '@federation/test',
          remotes: [],
        }),
      });
      const indexModule = new Index.Module({
        remoteInfo: {
          name: '@federation/test',
          entry: '',
          type: '',
          entryGlobalName: '',
          shareScope: '',
        },
        host: new Index.FederationHost({
          name: '@federation/test',
          remotes: [],
        }),
      });

      // Get the method names of Module instances, excluding private methods
      const embeddedMethods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(embeddedModule),
      )
        .filter(
          (prop) =>
            typeof embeddedModule[prop] === 'function' && !isPrivate(prop),
        )
        .sort();
      const indexMethods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(indexModule),
      )
        .filter(
          (prop) => typeof indexModule[prop] === 'function' && !isPrivate(prop),
        )
        .sort();
      // Compare the method names
      expect(embeddedMethods).toEqual(indexMethods);
    });
  });
  describe('General API Tests', () => {
    describe('matchRemote', () => {
      it('match default export with pkgName', () => {
        const matchInfo = matchRemoteWithNameAndExpose(
          [
            {
              name: '@federation/matchRemote',
              version: '1.0.0',
            },
            {
              name: '@federation/matchRemote2',
              version: '1.0.0',
            },
          ],
          '@federation/matchRemote',
        );
        assert(matchInfo, 'matchRemote should return a matchInfo');
        const { expose, remote } = matchInfo;
        expect(expose).toBe('.');
        expect(remote).toMatchObject({
          name: '@federation/matchRemote',
          version: '1.0.0',
        });
      });

      it('match default export with alias', () => {
        const matchInfo = matchRemoteWithNameAndExpose(
          [
            {
              name: '@federation/matchRemote',
              version: '1.0.0',
              alias: 'hello',
            },
            {
              name: '@federation/matchRemote2',
              version: '1.0.0',
            },
          ],
          'hello',
        );
        assert(matchInfo, 'matchRemote should return a matchInfo');
        const { expose, remote } = matchInfo;
        expect(expose).toBe('.');
        expect(remote).toMatchObject({
          name: '@federation/matchRemote',
          version: '1.0.0',
          alias: 'hello',
        });
      });

      it('match pkgName', () => {
        const matchInfo = matchRemoteWithNameAndExpose(
          [
            {
              name: '@federation/matchRemote',
              version: '1.0.0',
            },
            {
              name: '@federation/matchRemote2',
              version: '1.0.0',
            },
          ],
          '@federation/matchRemote/util',
        );
        assert(matchInfo, 'matchRemote should return a matchInfo');
        const { expose, remote } = matchInfo;
        expect(expose).toBe('./util');
        expect(remote).toMatchObject({
          name: '@federation/matchRemote',
          version: '1.0.0',
        });
      });

      it('match alias', () => {
        const matchInfo = matchRemoteWithNameAndExpose(
          [
            {
              name: '@federation/matchRemote',
              version: '1.0.0',
            },
            {
              name: '@federation/matchRemote2',
              alias: '@matchRemote2',
              version: '1.0.0',
            },
          ],
          '@matchRemote2/utils/add',
        );
        assert(matchInfo, 'matchRemote should return a matchInfo');
        const { expose, remote } = matchInfo;
        expect(expose).toBe('./utils/add');
        expect(remote).toMatchObject({
          name: '@federation/matchRemote2',
          alias: '@matchRemote2',
          version: '1.0.0',
        });
      });
    });

    // eslint-disable-next-line max-lines-per-function
    describe('loadRemote', () => {
      it('api', () => {
        const FederationInstance = new Embedded.FederationHost({
          name: '@federation-test/loadRemote-api',
          remotes: [],
        });
        expect(FederationInstance.loadRemote).toBeInstanceOf(Function);
      });

      it('loadRemote from global', async () => {
        const reset = addGlobalSnapshot({
          '@federation-test/globalinfo': {
            globalName: '',
            buildVersion: '',
            publicPath: '',
            remoteTypes: '',
            shared: [],
            remoteEntry: '',
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remotesInfo: {
              '@federation-test/app2': {
                matchedVersion: '0.0.1',
              },
            },
          },
          '@federation-test/app2:0.0.1': {
            globalName: '',
            publicPath: '',
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remoteEntry:
              'http://localhost:1111/resources/app2/federation-remote-entry.js',
          },
        });

        const FederationInstance = new Embedded.FederationHost({
          name: '@federation-test/globalinfo',
          remotes: [
            {
              name: '@federation-test/app2',
              version: '*',
            },
          ],
        });

        const module = await FederationInstance.loadRemote<() => string>(
          '@federation-test/app2/say',
        );
        assert(module, 'module should be a function');
        expect(module()).toBe('hello app2');
        reset();
      });

      it('loadRemote from global without hostSnapshot', async () => {
        const reset = addGlobalSnapshot({
          '@load-remote/app1': {
            globalName: `__FEDERATION_${'@load-remote/app1:custom'}__`,
            publicPath: 'http://localhost:1111/resources/load-remote/app1/',
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remoteEntry: 'federation-remote-entry.js',
          },
          '@load-remote/app2:0.0.1': {
            globalName: '',
            publicPath: 'http://localhost:1111/resources/load-remote/app2/',
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remoteEntry: 'federation-remote-entry.js',
          },
        });

        const FM = new Embedded.FederationHost({
          name: 'xxxxx',
          remotes: [
            {
              name: '@load-remote/app2',
              version: '0.0.1',
            },
            {
              name: '@load-remote/app1',
              version: '0.0.1',
            },
          ],
        });

        const module = await FM.loadRemote<() => string>(
          '@load-remote/app1/say',
        );
        assert(module, 'module should be a function');
        expect(module()).toBe('hello app1');

        const module2 = await FM.loadRemote<() => string>(
          '@load-remote/app2/say',
        );
        assert(module2, 'module should be a function');
        expect(module2()).toBe('hello app2');
        reset();
      });

      it('compatible with old structor', async () => {
        const reset = addGlobalSnapshot({
          '@federation-test/compatible': {
            globalName: '',
            buildVersion: '',
            publicPath: '',
            remoteTypes: '',
            shared: [],
            remoteEntry: '',
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remotesInfo: {
              '@federation-test/app2': {
                matchedVersion: '0.0.1',
              },
            },
          },
          '@federation-test/app2:0.0.1': {
            globalName: '',
            publicPath: '',
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remoteEntry:
              'http://localhost:1111/resources/app2/federation-remote-entry.js',
          },
        });

        const FederationInstance = new Embedded.FederationHost({
          name: '@federation-test/compatible',
          remotes: [
            {
              name: '@federation-test/app2',
              version: '*',
            },
          ],
        });
        const module = await FederationInstance.loadRemote<() => string>(
          '@federation-test/app2/say',
        );
        assert(module, 'module should be a function');
        expect(module()).toBe('hello app2');
        reset();
      });

      it('remote entry url with query', async () => {
        const FederationInstance = new Embedded.FederationHost({
          name: '@federation-test/compatible',
          remotes: [
            {
              name: '__FEDERATION_@federation-test/app2:custom__',
              alias: 'app2',
              entry:
                'http://localhost:1111/resources/app2/federation-remote-entry.js?kk=2',
            },
          ],
        });
        const module =
          await FederationInstance.loadRemote<() => string>('app2/say');
        assert(module, 'module should be a function');
        expect(module()).toBe('hello app2');
      });

      it('different instance with same module', async () => {
        const reset = addGlobalSnapshot({
          '@module-federation/load-remote-different-instance': {
            buildVersion: 'custom',
            publicPath: 'xx',
            remoteEntry: 'xx',
            remotesInfo: {
              '@module-federation/sub1': {
                matchedVersion: '1.0.2',
              },
            },
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            globalName: '',
            remoteTypes: 'index.d.ts',
            shared: [],
          },
          '@module-federation/sub1:1.0.2': {
            buildVersion: '1.0.2',
            globalName: '__FEDERATION_@module-federation/sub1:1.0.2__',
            modules: [],
            remoteEntryType: 'global',
            remoteTypes: 'index.d.ts',
            version: '0.0.1',
            remotesInfo: {},
            shared: [],
            publicPath:
              'http://localhost:1111/resources/load-remote/diff-instance/',
            remoteEntry: 'federation-remote-entry.js',
          },
        });
        const vmOptions = {
          remotes: [
            {
              name: '@module-federation/sub1',
              version: '1.0.2',
            },
          ],
          plugins: [
            {
              name: 'load-resouce-inbrowser',
              beforeInit(args: any) {
                args.options.inBrowser = true;
                return args;
              },
            },
          ],
        };
        const FM = new Embedded.FederationHost({
          name: '@module-federation/load-remote-different-instance',
          ...vmOptions,
        });
        const FM2 = new Embedded.FederationHost({
          name: '@module-federation/load-remote-different-instance2',
          ...vmOptions,
        });
        const [res1, res2] = await Promise.all([
          FM.loadRemote<() => string>('@module-federation/sub1'),
          FM2.loadRemote<() => string>('@module-federation/sub1'),
        ]);
        assert(res1, `res1 can't be null`);
        assert(res2, `res2 can't be null`);
        expect(res1()).toBe(res2());
        expect((globalThis as any).execTime).toBe(1);
        reset();
      });
    });

    describe('loadRemote with manifest.json', () => {
      it('duplicate request manifest.json', async () => {
        const FM = new Embedded.FederationHost({
          name: '@demo/host',
          remotes: [
            {
              name: '@demo/main',
              entry:
                'http://localhost:1111/resources/main/federation-manifest.json',
            },
          ],
        });

        const FM2 = new Embedded.FederationHost({
          name: '@demo/host2',
          remotes: [
            {
              name: '@demo/main',
              entry:
                'http://localhost:1111/resources/main/federation-manifest.json',
            },
          ],
        });

        const [module, , module2] = await Promise.all([
          FM.loadRemote<Promise<() => string>>('@demo/main/say'),
          FM.loadRemote<Promise<() => string>>('@demo/main/add'),
          FM2.loadRemote<Promise<() => string>>('@demo/main/say'),
        ]);
        assert(module);
        assert(module2);
        expect(module()).toBe(module2());
        expect(module()).toBe('hello world');
        expect(
          requestList.get(
            'http://localhost:1111/resources/main/federation-manifest.json',
          ),
        ).toBe(1);
      });

      it('circulate deps', async () => {
        setGlobalFederationConstructor(Embedded.FederationHost, true);
        const FM = Embedded.init({
          name: '@circulate-deps/app1',
          remotes: [
            {
              name: '@circulate-deps/app2',
              entry:
                'http://localhost:1111/resources/load-remote/circulate-dep-app2/federation-manifest.json',
            },
          ],
        });

        const app1Module = await FM.loadRemote<Promise<() => string>>(
          '@circulate-deps/app2/say',
        );
        assert(app1Module);
        const res = await app1Module();
        expect(res).toBe('@circulate-deps/app2');

        Global.__FEDERATION__.__INSTANCES__ = [];
        setGlobalFederationConstructor(undefined, true);
      });

      it('manifest.json with query', async () => {
        const FM = new Embedded.FederationHost({
          name: '@demo/host',
          remotes: [
            {
              name: '@demo/main',
              entry:
                'http://localhost:1111/resources/main/federation-manifest.json?query=2',
            },
          ],
        });

        const [module] = await Promise.all([
          FM.loadRemote<Promise<() => string>>('@demo/main/say'),
        ]);
        assert(module);
        expect(module()).toBe('hello world');
      });
    });

    describe('lazy loadRemote add remote into snapshot', () => {
      it('load remoteEntry', async () => {
        const reset = addGlobalSnapshot({
          '@demo/app2': {
            buildVersion: '1.0.2',
            globalName: `__FEDERATION_${'@load-remote/app2:custom'}__`,
            modules: [],
            remoteEntryType: 'global',
            remoteTypes: 'index.d.ts',
            version: '0.0.1',
            remotesInfo: {},
            shared: [],
            publicPath: 'http://localhost:1111/resources/load-remote/app2/',
            remoteEntry: 'federation-remote-entry.js',
          },
          '@demo/app1': {
            consumerList: ['@demo/app2:0.0.1'],
            globalName: `__FEDERATION_${'@load-remote/app1:custom'}__`,
            publicPath: 'http://localhost:1111/resources/load-remote/app1/',
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remoteEntry: 'federation-remote-entry.js',
          },
        });
        const federationInstance = new Embedded.FederationHost({
          name: '@demo/app1',
          remotes: [
            {
              name: '@demo/app2',
              alias: 'app2',
              version: '',
            },
          ],
        });
        const snapshot = getGlobalSnapshot();
        const hostModuleInfo = snapshot['@demo/app1'];
        assert(
          hostModuleInfo && 'remotesInfo' in hostModuleInfo,
          'hostModuleInfo Cannot be empty',
        );
        const beforeHostRemotesInfo = hostModuleInfo.remotesInfo;
        const beforeRemotesLength = Object.keys(beforeHostRemotesInfo).length;
        expect(beforeRemotesLength).toBe(0);

        await federationInstance.loadRemote('app2/say');
        const afterHostRemotesInfo = hostModuleInfo.remotesInfo;
        const afterRemotesLength = Object.keys(afterHostRemotesInfo).length;
        expect(afterRemotesLength).toBe(1);
        reset();
      });

      it('load manifest', async () => {
        const reset = addGlobalSnapshot({
          '@demo/app1': {
            globalName: `__FEDERATION_${'@load-remote/app1:custom'}__`,
            publicPath: 'http://localhost:1111/resources/load-remote/app1/',
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remoteEntry: 'federation-remote-entry.js',
          },
        });

        const federationInstance = new Embedded.FederationHost({
          name: '@demo/app1',
          remotes: [
            {
              name: '@demo/main',
              alias: 'main',
              entry:
                'http://localhost:1111/resources/main/federation-manifest.json',
            },
          ],
        });
        const snapshot = getGlobalSnapshot();
        const hostModuleInfo = snapshot['@demo/app1'];
        assert(
          hostModuleInfo && 'remotesInfo' in hostModuleInfo,
          'hostModuleInfo Cannot be empty',
        );
        const beforeHostRemotesInfo = hostModuleInfo.remotesInfo;
        const beforeRemotesLength = Object.keys(beforeHostRemotesInfo).length;
        expect(beforeRemotesLength).toBe(0);

        await federationInstance.loadRemote('main/say');
        const afterHostRemotesInfo = hostModuleInfo.remotesInfo;
        const afterRemotesLength = Object.keys(afterHostRemotesInfo).length;
        expect(afterRemotesLength).toBe(1);
        reset();
      });
    });

    describe('loadRemote', () => {
      it('api', async () => {
        const jsSyncAssetPath = 'resources/load-remote/app2/say.sync.js';
        const remotePublicPath = 'http://localhost:1111/';
        const reset = addGlobalSnapshot({
          '@federation-test/globalinfo': {
            globalName: '',
            buildVersion: '',
            publicPath: '',
            remoteTypes: '',
            shared: [],
            remoteEntry: '',
            remoteEntryType: 'global',
            modules: [],
            version: '0.0.1',
            remotesInfo: {
              '@federation-test/app2': {
                matchedVersion: '0.0.1',
              },
            },
          },
          '@federation-test/app2:0.0.1': {
            globalName: '',
            publicPath: remotePublicPath,
            remoteTypes: '',
            shared: [],
            buildVersion: 'custom',
            remotesInfo: {},
            remoteEntryType: 'global',
            modules: [
              {
                moduleName: 'say',
                assets: {
                  css: {
                    sync: ['sub2/say.sync.css'],
                    async: ['sub2/say.async.css'],
                  },
                  js: {
                    sync: [jsSyncAssetPath],
                    async: [],
                  },
                },
              },
            ],
            version: '0.0.1',
            remoteEntry: 'resources/app2/federation-remote-entry.js',
          },
        });

        const FederationInstance = new Embedded.FederationHost({
          name: '@federation-test/globalinfo',
          remotes: [
            {
              name: '@federation-test/app2',
              version: '*',
            },
          ],
        });

        await FederationInstance.loadRemote<() => string>(
          '@federation-test/app2/say',
        );
        // @ts-ignore fakeSrc is local mock attr, which value is the same as src
        const loadedSrcs = [...document.querySelectorAll('script')].map(
          (i) => (i as any).fakeSrc,
        );
        expect(loadedSrcs.includes(`${remotePublicPath}${jsSyncAssetPath}`));
        reset();
      });
    });
  });
});
