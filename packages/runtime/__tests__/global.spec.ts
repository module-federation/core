import { expectTypeOf, describe, it, vi, expect, assert } from 'vitest';
import {
  FederationHost,
  FederationRuntimePlugin,
  init,
  loadRemote,
  loadShare,
  loadShareSync,
} from '../src/index';
import { getGlobalHostPlugins, getInfoWithoutType } from '../src/global';
import { mockStaticServer, removeScriptTags } from './mock/utils';

describe('global', () => {
  it('inject mode', () => {
    globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = vi.fn();
    const injectArgs = {
      name: '@federation/inject-mode',
      remotes: [],
    };
    const GM = init(injectArgs);
    expect(GM.constructor).toBe(
      globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__,
    );
    expect(globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__).toBeCalledWith(
      injectArgs,
    );
  });

  it('getInfoWithoutType', () => {
    const snapshot = {
      '@federation/app1': 1,
      '@federation/app2': 2,
      'app:@federation/app3': 3,
      'npm:@federation/app4': 4,
    };

    const res = getInfoWithoutType(snapshot, '@federation/app1');
    expect(res).toMatchObject({
      key: '@federation/app1',
      value: 1,
    });

    const res2 = getInfoWithoutType(snapshot, '@federation/app3' as any);
    expect(res2).toMatchObject({
      key: 'app:@federation/app3',
      value: 3,
    });

    const res3 = getInfoWithoutType(snapshot, '@federation/app4' as any);
    expect(res3).toMatchObject({
      key: 'npm:@federation/app4',
      value: 4,
    });
  });

  describe('global types (generic)', () => {
    it('loadRemote', async () => {
      const typedLoadRemote: typeof loadRemote<string> = loadRemote;
      expectTypeOf(typedLoadRemote).returns.toMatchTypeOf<
        Promise<string | null>
      >();
      expectTypeOf(typedLoadRemote).returns.not.toMatchTypeOf<Promise<null>>();
    });

    it('loadShare', async () => {
      const typedLoadShare: typeof loadShare<string> = loadShare;
      expectTypeOf(typedLoadShare).returns.toMatchTypeOf<
        Promise<false | (() => string | undefined)>
      >();
      expectTypeOf(typedLoadShare).returns.not.toMatchTypeOf<
        Promise<false | (() => undefined)>
      >();
    });

    it('loadShareSync', () => {
      const typedLoadShareSync: typeof loadShareSync<string> = loadShareSync;
      expectTypeOf(typedLoadShareSync).returns.toMatchTypeOf<
        () => string | never
      >();
      expectTypeOf(typedLoadShareSync).returns.not.toMatchTypeOf<() => never>();
    });
  });

  describe('globalPlugins', async () => {
    mockStaticServer({
      baseDir: __dirname,
      filterKeywords: [],
      basename: 'http://localhost:1111/',
    });
    beforeEach(() => {
      removeScriptTags();
    });

    it('should load the globalPlugins to the global instance', async () => {
      const testPlugin: () => FederationRuntimePlugin = () => ({
        name: 'testPlugin',
      });
      const options = {
        name: '@federation/hooks',
        remotes: [],
        globalPlugins: [testPlugin()],
      };
      new FederationHost(options);
      expect(getGlobalHostPlugins()).toEqual(
        expect.arrayContaining(options.globalPlugins),
      );
    });

    it('core hooks args from global plugin', async () => {
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

        globalPlugins: [testPlugin()],
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
      expect(beforeInitArgs.userOptions.globalPlugins).toEqual(
        expect.arrayContaining(options.globalPlugins),
      );
      expect(initArgs).toMatchObject({
        options: GM.options,
        origin: GM,
      });
      assert(initArgs, "initArgs can't be undefined");
      expect(initArgs.options.globalPlugins).toEqual(
        expect.arrayContaining(options.globalPlugins),
      );
      // Modify ./sub to expose ./add
      const module =
        await GM.loadRemote<(...args: Array<number>) => number>(
          '@demo/main/sub',
        );
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
  });
});
