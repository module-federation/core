import { assert, describe, test, it } from 'vitest';
import { ModuleFederation } from '../src/core';
import { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import { addGlobalSnapshot } from '../src/global';
import {
  AsyncHook,
  AsyncWaterfallHook,
  SyncHook,
  SyncWaterfallHook,
} from '../src/utils/hooks';

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
    const testPlugin: () => ModuleFederationRuntimePlugin = () => ({
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
    const GM = new ModuleFederation(options);
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

    const INSTANCE = new ModuleFederation({
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
          createScript({ url, remoteInfo, resourceContext }) {
            // Assert remote context is exposed for remoteEntry loads
            if (url === testRemoteEntry) {
              expect(remoteInfo).toMatchObject({
                name: '@loader-hooks/app2',
                entry: testRemoteEntry,
              });
              expect(resourceContext).toMatchObject({
                initiator: 'loadRemote',
                resourceType: 'remoteEntry',
              });
              expect(resourceContext?.id).toBe('@loader-hooks/app2/say');
            }
            if (url === preloadRemoteEntry) {
              expect(remoteInfo).toMatchObject({
                name: '@loader-hooks/app3',
                entry: preloadRemoteEntry,
              });
              expect(resourceContext).toMatchObject({
                initiator: 'preloadRemote',
                id: '@loader-hooks/app3/*',
                resourceType: 'remoteEntry',
              });
            }
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

  it('loader createLink hooks expose remoteInfo in preloadRemote', async () => {
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
          '@loader-hooks/app3': {
            matchedVersion: '0.0.1',
          },
        },
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

    let lastLinkRemoteInfo: any;
    const INSTANCE = new ModuleFederation({
      name: '@loader-hooks/globalinfo',
      remotes: [
        {
          name: '@loader-hooks/app3',
          alias: 'app3-alias',
          version: '*',
        },
      ],
      plugins: [
        {
          name: 'force-preload-assets',
          async generatePreloadAssets() {
            return {
              cssAssets: ['http://localhost:1111/__virtual__/style.css'],
              jsAssetsWithoutEntry: [
                'http://localhost:1111/__virtual__/chunk.js',
              ],
              entryAssets: [],
            } as any;
          },
        },
        {
          name: 'capture-link-remote-info',
          createLink({ url, attrs, remoteInfo, resourceContext }) {
            lastLinkRemoteInfo = remoteInfo;
            expect(resourceContext).toMatchObject({
              initiator: 'preloadRemote',
              id: '@loader-hooks/app3/*',
            });
            const link = document.createElement('link');
            link.href = url;
            if (attrs) {
              Object.entries(attrs).forEach(([k, v]) => {
                link.setAttribute(k, String(v));
              });
            }
            setTimeout(() => {
              link.onload?.(new Event('load'));
            });
            return link;
          },
        },
      ],
    });

    await INSTANCE.preloadRemote([{ nameOrAlias: 'app3-alias' }]);
    expect(lastLinkRemoteInfo).toMatchObject({
      name: '@loader-hooks/app3',
    });

    reset();
  });

  it('preloadRemote rejects when a preload resource fails', async () => {
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
          '@loader-hooks/app3': {
            matchedVersion: '0.0.1',
          },
        },
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

    let afterPreloadArgs: any;
    const INSTANCE = new ModuleFederation({
      name: '@loader-hooks/globalinfo',
      remotes: [
        {
          name: '@loader-hooks/app3',
          version: '*',
        },
      ],
      plugins: [
        {
          name: 'force-preload-assets',
          async generatePreloadAssets() {
            return {
              cssAssets: [],
              jsAssetsWithoutEntry: [
                'http://localhost:1111/__virtual__/missing-chunk.js',
              ],
              entryAssets: [],
            } as any;
          },
          createLink({ url }) {
            const link = document.createElement('link');
            link.href = url;
            setTimeout(() => {
              link.onerror?.(new Event('error'));
            });
            return link;
          },
          afterPreloadRemote(args) {
            afterPreloadArgs = args;
          },
        },
      ],
    });

    await expect(
      INSTANCE.preloadRemote([{ nameOrAlias: '@loader-hooks/app3' }]),
    ).rejects.toThrow('preloadRemote failed to load 1 resource');

    expect(afterPreloadArgs.results[0].results[0]).toMatchObject({
      url: 'http://localhost:1111/__virtual__/missing-chunk.js',
      status: 'error',
      resourceType: 'js',
      initiator: 'preloadRemote',
      id: '@loader-hooks/app3/*',
    });

    reset();
  });

  it('uses exact expose ids when preloadRemote is configured with exposes', async () => {
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
          '@loader-hooks/app3': {
            matchedVersion: '0.0.1',
          },
        },
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

    const generatedExposes: Array<string[] | undefined> = [];
    const resourceIds: string[] = [];
    const INSTANCE = new ModuleFederation({
      name: '@loader-hooks/globalinfo',
      remotes: [
        {
          name: '@loader-hooks/app3',
          version: '*',
        },
      ],
      plugins: [
        {
          name: 'force-expose-preload-assets',
          async generatePreloadAssets(args) {
            generatedExposes.push(args.preloadOptions.preloadConfig.exposes);
            const expose = args.preloadOptions.preloadConfig.exposes?.[0];
            return {
              cssAssets: [],
              jsAssetsWithoutEntry: [
                `http://localhost:1111/__virtual__/${expose}.js`,
              ],
              entryAssets: [],
            } as any;
          },
          createLink({ url, resourceContext }) {
            resourceIds.push(resourceContext?.id || '');
            const link = document.createElement('link');
            link.href = url;
            setTimeout(() => {
              link.onload?.(new Event('load'));
            });
            return link;
          },
        },
      ],
    });

    await INSTANCE.preloadRemote([
      { nameOrAlias: '@loader-hooks/app3', exposes: ['Button', 'Card'] },
    ]);

    expect(generatedExposes).toEqual([['Button'], ['Card']]);
    expect(resourceIds).toEqual([
      '@loader-hooks/app3/Button',
      '@loader-hooks/app3/Card',
    ]);

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
    let lastFetchRemoteInfo: any;
    const fetchPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'fetch-plugin',
      fetch(url, options, remoteInfo, resourceContext) {
        lastFetchRemoteInfo = remoteInfo;
        expect(resourceContext).toMatchObject({
          initiator: 'loadRemote',
          id: '@loader-hooks/app2/say',
          resourceType: 'manifest',
        });
        if (url === 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json') {
          return Promise.resolve(responseBody);
        }
      },
    });
    const INSTANCE = new ModuleFederation({
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
    expect(lastFetchRemoteInfo).toMatchObject({
      name: '@loader-hooks/app2',
      entry: 'http://mockxxx.com/loader-fetch-hooks-mf-manifest.json',
    });
  });

  it('emits manifest snapshot lifecycle once when loading a manifest remote', async () => {
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

    const fetchPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'fetch-plugin',
      fetch(url) {
        if (url === 'http://mockxxx.com/snapshot-hooks-mf-manifest.json') {
          return Promise.resolve(
            new Response(JSON.stringify(data), {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }
      },
    });
    const snapshotEvents: string[] = [];
    const snapshotPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'snapshot-observer-plugin',
      loadSnapshot(args) {
        snapshotEvents.push('loadSnapshot');
        return args;
      },
      loadRemoteSnapshot(args) {
        snapshotEvents.push(args.from);
        return args;
      },
    });

    const INSTANCE = new ModuleFederation({
      name: '@loader-hooks/snapshot',
      remotes: [
        {
          name: '@loader-hooks/app2',
          entry: 'http://mockxxx.com/snapshot-hooks-mf-manifest.json',
        },
      ],
      plugins: [fetchPlugin(), snapshotPlugin()],
    });

    const res = await INSTANCE.loadRemote<() => string>(
      '@loader-hooks/app2/say',
    );
    assert(res);
    expect(res()).toBe('hello app2');
    expect(snapshotEvents).toEqual(['loadSnapshot', 'manifest']);
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

    const fetchPlugin: () => ModuleFederationRuntimePlugin = function () {
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
    const loadEntryPlugin = function (): ModuleFederationRuntimePlugin {
      return {
        name: 'load-entry-plugin',
        loadEntry({ remoteInfo }) {
          if (remoteInfo.name === '@loader-hooks/app3') {
            return {
              init() {
                // Empty implementation for test
              },
              get(path) {
                return () => path;
              },
            };
          }
        },
      } as any;
    };

    const INSTANCE = new ModuleFederation({
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

  it('sync hooks preserve previous returned value when later listeners return nothing', () => {
    const hook = new SyncHook<[string], string | void>('sync-noop');
    const calls: Array<string> = [];

    hook.on((value) => {
      calls.push(`first:${value}`);
      return 'first-result';
    });
    hook.on((value) => {
      calls.push(`second:${value}`);
    });

    expect(hook.emit('payload')).toBe('first-result');
    expect(calls).toEqual(['first:payload', 'second:payload']);
  });

  it('sync hooks use the latest explicit returned value', () => {
    const hook = new SyncHook<[string], string | void>('sync-override');

    hook.on(() => 'first-result');
    hook.on(() => 'second-result');

    expect(hook.emit('payload')).toBe('second-result');
  });

  it('async hooks preserve previous returned value when later listeners return nothing', async () => {
    const hook = new AsyncHook<[string], string | void | false>('async-noop');
    const calls: Array<string> = [];

    hook.on(async (value) => {
      calls.push(`first:${value}`);
      return 'first-result';
    });
    hook.on((value) => {
      calls.push(`second:${value}`);
    });

    await expect(hook.emit('payload')).resolves.toBe('first-result');
    expect(calls).toEqual(['first:payload', 'second:payload']);
  });

  it('async hooks use the latest explicit returned value', async () => {
    const hook = new AsyncHook<[string], string | void | false>(
      'async-override',
    );

    hook.on(async () => 'first-result');
    hook.on(() => 'second-result');

    await expect(hook.emit('payload')).resolves.toBe('second-result');
  });

  it('async hooks treat returning the original payload as no explicit result', async () => {
    const hook = new AsyncHook<
      [{ id: string }],
      { id: string; wrapped?: boolean } | void | false
    >('async-passthrough');
    const payload = { id: 'remote/Button' };
    const wrapped = { id: 'remote/Button', wrapped: true };

    hook.on(() => wrapped);
    hook.on((args) => args);

    await expect(hook.emit(payload)).resolves.toBe(wrapped);
  });

  it('async hooks still abort when a listener returns false', async () => {
    const hook = new AsyncHook<[string], string | void | false>('async-abort');
    const calls: Array<string> = [];

    hook.on(() => {
      calls.push('first');
      return 'first-result';
    });
    hook.on(() => {
      calls.push('second');
      return false;
    });
    hook.on(() => {
      calls.push('third');
      return 'third-result';
    });

    await expect(hook.emit('payload')).resolves.toBe(false);
    expect(calls).toEqual(['first', 'second']);
  });

  it('sync waterfall hooks keep the current payload when observers return nothing', () => {
    const hook = new SyncWaterfallHook<{ id: string; changed?: boolean }>(
      'sync-waterfall-noop',
    );

    hook.on((args) => ({
      ...args,
      changed: true,
    }));
    hook.on(() => undefined);

    expect(hook.emit({ id: 'remote/Button' })).toEqual({
      id: 'remote/Button',
      changed: true,
    });
  });

  it('async waterfall hooks keep the current payload when observers return nothing', async () => {
    const hook = new AsyncWaterfallHook<{ id: string; changed?: boolean }>(
      'async-waterfall-noop',
    );

    hook.on(async (args) => ({
      ...args,
      changed: true,
    }));
    hook.on(() => undefined);

    await expect(hook.emit({ id: 'remote/Button' })).resolves.toEqual({
      id: 'remote/Button',
      changed: true,
    });
  });

  it('observer plugins do not clear errorLoadRemote fallback results', async () => {
    let observedLifecycle: string | undefined;
    const fallbackPlugin: ModuleFederationRuntimePlugin = {
      name: 'fallback-plugin',
      errorLoadRemote() {
        return {
          default: () => 'fallback component',
        };
      },
    };
    const observerPlugin: ModuleFederationRuntimePlugin = {
      name: 'observer-plugin',
      errorLoadRemote(args) {
        observedLifecycle = args.lifecycle;
      },
    };
    const GM = new ModuleFederation({
      name: '@hooks/error-load-remote-fallback',
      remotes: [],
      plugins: [fallbackPlugin, observerPlugin],
    });

    const result = (await GM.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
      {
        id: '@demo/fallback/component',
        error: new Error('load failed'),
        from: 'runtime',
        lifecycle: 'onLoad',
        origin: GM,
      },
    )) as { default: () => string };

    expect(result.default()).toBe('fallback component');
    expect(observedLifecycle).toBe('onLoad');
  });
});
