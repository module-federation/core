import 'whatwg-fetch';
import { assert, describe, it } from 'vitest';
import { FederationHost, init } from '../src/index';
import { mockRemoteSnapshot } from './mock/utils';
import { matchRemoteWithNameAndExpose } from '@module-federation/runtime-core';
import {
  addGlobalSnapshot,
  getGlobalSnapshot,
  Global,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';
import { requestList } from './mock/env';

describe('matchRemote', () => {
  it('matches default export with pkgName', () => {
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
  it('matches default export with alias', () => {
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
  it('matches pkgName', () => {
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
  it('matches alias', () => {
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
  it('api functionality', () => {
    const FederationInstance = new FederationHost({
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

    const FederationInstance = new FederationHost({
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

    const FM = new FederationHost({
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

    const module = await FM.loadRemote<() => string>('@load-remote/app1/say');
    assert(module, 'module should be a function');
    expect(module()).toBe('hello app1');

    const module2 = await FM.loadRemote<() => string>('@load-remote/app2/say');
    assert(module2, 'module should be a function');
    expect(module2()).toBe('hello app2');
    reset();
  });
  it('is compatible with old structure', async () => {
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

    const FederationInstance = new FederationHost({
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
  it('handles remote entry URL with query', async () => {
    const FederationInstance = new FederationHost({
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
  it('handles different instances with the same module', async () => {
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
    const FM = new FederationHost({
      name: '@module-federation/load-remote-different-instance',
      ...vmOptions,
    });
    const FM2 = new FederationHost({
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
  it('handles duplicate request to manifest.json', async () => {
    const FM = new FederationHost({
      name: '@demo/host',
      remotes: [
        {
          name: '@demo/main',
          entry:
            'http://localhost:1111/resources/main/federation-manifest.json',
        },
      ],
    });

    const FM2 = new FederationHost({
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
  it('handles circular dependencies', async () => {
    setGlobalFederationConstructor(FederationHost, true);
    const FM = init({
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
  it('handles manifest.json with query', async () => {
    const FM = new FederationHost({
      name: '@demo/host',
      remotes: [
        {
          name: '@demo/main',
          entry:
            'http://localhost:1111/resources/main/federation-manifest.json?query=2',
        },
      ],
    });

    const [module, ,] = await Promise.all([
      FM.loadRemote<Promise<() => string>>('@demo/main/say'),
    ]);
    assert(module);
    expect(module()).toBe('hello world');
  });
});
describe('lazy loadRemote and add remote into snapshot', () => {
  it('loads remoteEntry', async () => {
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
    const federationInstance = new FederationHost({
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
  it('loads manifest', async () => {
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

    const federationInstance = new FederationHost({
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
  it('loads remote synchronously', async () => {
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

    const FederationInstance = new FederationHost({
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
