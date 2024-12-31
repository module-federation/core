import { assert, describe, test, it } from 'vitest';
import {
  FederationHost,
  addGlobalSnapshot,
} from '@module-federation/runtime-core';
import { FederationRuntimePlugin } from '@module-federation/runtime-core/types';
import { mockStaticServer, removeScriptTags } from './mock/utils';

// eslint-disable-next-line max-lines-per-function
describe('hooks', () => {
  mockStaticServer({
    baseDir: __dirname,
    filterKeywords: [],
    basename: 'http://localhost:1111/',
  });
  beforeEach(() => {
    removeScriptTags();
  });

  it('core hooks args', async () => {
    let beforeInitArgs: any,
      initArgs: any,
      beforeLoadRemoteArgs,
      loadRemoteArgs;
    const testPlugin: () => FederationRuntimePlugin = () => ({
      name: 'testPlugin',
      beforeInit(args) {
        beforeInitArgs = args;
        return args;
      },
      init(args) {
        initArgs = args;
      },
      beforeRequest(args) {
        return new Promise((resolve) => {
          beforeLoadRemoteArgs = args;
          setTimeout(
            () =>
              resolve({
                ...args,
                id: '@demo/main/add',
              }),
            1000,
          );
        });
      },
      onLoad(args) {
        loadRemoteArgs = args;
      },
    });

    const options = {
      name: '@federation/hooks',
      remotes: [
        {
          name: '@demo/main',
          alias: 'main',
          entry:
            'http://localhost:1111/resources/main/federation-manifest.json',
        },
      ],
      plugins: [testPlugin()],
    };
    const GM = new FederationHost(options);
    assert(beforeInitArgs, "beforeInitArgs can't be undefined");
    expect(beforeInitArgs).toMatchObject({
      options: {
        name: options.name,
        remotes: options.remotes,
      },
      origin: GM,
    });
    expect(beforeInitArgs.userOptions.plugins).toEqual(
      expect.arrayContaining(options.plugins),
    );
    expect(initArgs).toMatchObject({
      options: GM.options,
      origin: GM,
    });
    assert(initArgs, "initArgs can't be undefined");
    expect(initArgs.options.plugins).toEqual(
      expect.arrayContaining(options.plugins),
    );
    // Modify ./sub to expose ./add
    const module =
      await GM.loadRemote<(...args: Array<number>) => number>('@demo/main/sub');
    assert(module, 'loadRemote should return a module');
    expect(beforeLoadRemoteArgs).toMatchObject({
      id: '@demo/main/sub',
      options: GM.options,
      origin: GM,
    });
    expect(loadRemoteArgs).toMatchObject({
      id: '@demo/main/add',
      pkgNameOrAlias: '@demo/main',
      expose: './add',
      origin: GM,
    });
    expect(module(1, 2, 3, 4, 5)).toBe(15);
  });

  it('loader hooks', async () => {
    const testRemoteEntry =
      'http://localhost:1111/resources/hooks/app2/federation-remote-entry.js';
    const preloadRemoteEntry =
      'http://localhost:1111/resources/hooks/app3/federation-remote-entry.js';
    const remotePublicPath = 'http://localhost:1111/';
    const reset = addGlobalSnapshot({
      '@loader-hooks/globalinfo': {
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
          '@loader-hooks/app2': {
            matchedVersion: '0.0.1',
          },
          '@loader-hooks/app3': {
            matchedVersion: '0.0.1',
          },
        },
      },
      '@loader-hooks/app2:0.0.1': {
        globalName: '@loader-hooks/app2',
        publicPath: remotePublicPath,
        remoteTypes: '',
        shared: [],
        buildVersion: 'custom',
        remotesInfo: {},
        remoteEntryType: 'global',
        modules: [],
        version: '0.0.1',
        remoteEntry: 'resources/hooks/app2/federation-remote-entry.js',
      },
      '@loader-hooks/app3:0.0.1': {
        globalName: '@loader-hooks/app3',
        publicPath: remotePublicPath,
        remoteTypes: '',
        shared: [],
        buildVersion: 'custom',
        remotesInfo: {},
        remoteEntryType: 'global',
        modules: [],
        version: '0.0.1',
        remoteEntry: 'resources/hooks/app3/federation-remote-entry.js',
      },
    });

    const INSTANCE = new FederationHost({
      name: '@loader-hooks/globalinfo',
      remotes: [
        {
          name: '@loader-hooks/app2',
          version: '*',
        },
        {
          name: '@loader-hooks/app3',
          version: '*',
        },
      ],
      plugins: [
        {
          name: 'change-script-attribute',
          createScript({ url }) {
            const script = document.createElement('script');
            script.src = url;
            if (url === testRemoteEntry) {
              script.setAttribute('loader-hooks', 'isTrue');
              script.setAttribute('crossorigin', 'anonymous');
              return script;
            } else if (url === preloadRemoteEntry) {
              script.setAttribute('loader-hooks', 'isFalse');
              return script;
            }
          },
        },
      ],
    });

    const res = await INSTANCE.loadRemote<() => string>(
      '@loader-hooks/app2/say',
    );
    assert(res);
    expect(res()).toBe('hello app2');
    const testLoadedScript = [...document.querySelectorAll('script')].find(
      // @ts-ignore fakeSrc is local mock attr, which value is the same as src
      (script) => script.fakeSrc === testRemoteEntry,
    );
    assert(testLoadedScript);
    expect(testLoadedScript.getAttribute('loader-hooks')).toBe('isTrue');
    expect(testLoadedScript.getAttribute('crossorigin')).toBe('anonymous');

    await INSTANCE.preloadRemote([{ nameOrAlias: '@loader-hooks/app3' }]);
    const testLoadedScript1 = [...document.querySelectorAll('script')].find(
      (script) => (script as any).fakeSrc === preloadRemoteEntry,
    );
    assert(testLoadedScript1);
    expect(testLoadedScript1.getAttribute('loader-hooks')).toBe('isFalse');

    reset();
  });

  it('loader fetch hooks', async () => {
    const data = {
      id: '@loader-hooks/app2',
      name: '@loader-hooks/app2',
      metaData: {
        name: '@loader-hooks/app2',
        publicPath: 'http://localhost:1111/',
        type: 'app',
        buildInfo: {
          buildVersion: 'custom',
        },
        remoteEntry: {
          name: 'federation-remote-entry.js',
          path: 'resources/hooks/app2/',
        },
        types: {
          name: 'index.d.ts',
          path: './',
        },
        globalName: '@loader-hooks/app2',
      },
      remotes: [],
      shared: [],
      exposes: [],
    };

    const responseBody = new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });
    const fetchPlugin: () => FederationRuntimePlugin = () => ({
      name: 'fetch-plugin',
      fetch(url, options) {
        if (url === 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json') {
          return Promise.resolve(responseBody);
        }
      },
    });
    const INSTANCE = new FederationHost({
      name: '@loader-hooks/fetch',
      remotes: [
        {
          name: '@loader-hooks/app2',
          entry: 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json',
        },
      ],
      plugins: [fetchPlugin()],
    });

    const res = await INSTANCE.loadRemote<() => string>(
      '@loader-hooks/app2/say',
    );
    assert(res);
    expect(res()).toBe('hello app2');
  });

  it('loaderEntry hooks', async () => {
    const data = {
      id: '@loader-hooks/app2',
      name: '@loader-hooks/app2',
      metaData: {
        name: '@loader-hooks/app2',
        publicPath: 'http://localhost:1111/',
        type: 'app',
        buildInfo: {
          buildVersion: 'custom',
        },
        remoteEntry: {
          name: 'federation-remote-entry.js',
          path: 'resources/hooks/app2/',
        },
        types: {
          name: 'index.d.ts',
          path: './',
        },
        globalName: '@loader-hooks/app2',
      },
      remotes: [],
      shared: [],
      exposes: [],
    };

    const responseBody = new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });

    const fetchPlugin: () => FederationRuntimePlugin = function () {
      return {
        name: 'fetch-plugin',
        fetch(url, options) {
          if (
            url === 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json'
          ) {
            return Promise.resolve(responseBody);
          }
        },
      };
    };
    const loadEntryPlugin = function (): FederationRuntimePlugin {
      return {
        name: 'load-entry-plugin',
        loadEntry({ remoteInfo }) {
          if (remoteInfo.name === '@loader-hooks/app3') {
            return {
              init() {},
              get(path) {
                return () => path;
              },
            };
          }
        },
      } as any;
    };

    const INSTANCE = new FederationHost({
      name: '@loader-hooks/fetch',
      remotes: [
        {
          name: '@loader-hooks/app2',
          entry: 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json',
        },
        {
          name: '@loader-hooks/app3',
          entry: 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json',
        },
      ],
      plugins: [fetchPlugin(), loadEntryPlugin()],
    });

    const res = await INSTANCE.loadRemote<() => string>(
      '@loader-hooks/app2/say',
    );
    assert(res);
    expect(res()).toBe('hello app2');
    const loadEntryTestRes = await INSTANCE.loadRemote<() => string>(
      '@loader-hooks/app3/testtest',
    );
    assert(loadEntryTestRes);
    expect(loadEntryTestRes).toBe('./testtest');
  });
});
