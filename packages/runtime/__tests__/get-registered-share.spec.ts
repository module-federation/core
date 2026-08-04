import { describe, it, expect } from '@rstest/core';
import { assert, getRegisteredShare } from '@module-federation/runtime-core';
import { TreeShakingStatus } from '@module-federation/sdk';

describe('get expected shared', () => {
  it('get loading shared if sharedStrategy is "loaded-first"', () => {
    let res;
    const promise = new Promise((resolve) => {
      // pending
      res = resolve;
    });
    const shareScopeMap = {
      default: {
        react: {
          '18.2.0': {
            deps: [],
            useIn: [],
            from: 'host',
            get: () => {
              //noop
            },
            loaded: undefined,
            loading: promise,
            lib: undefined,
            version: '18.2.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.2.0',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
          '18.3.1': {
            deps: [],
            useIn: [],
            from: 'remote',
            loaded: undefined,
            get: () => {
              //noop
            },
            loading: null,
            version: '18.3.1',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.3.1',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
        },
      },
    };

    const shareInfoRes = {
      deps: [],
      useIn: [],
      from: 'remote',
      loaded: undefined,
      get: () => {
        //noop
      },
      loading: null,
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        fixedDependencies: false,
        requiredVersion: '18.3.1',
        strictVersion: false,
        singleton: true,
        eager: false,
      },
      strategy: 'loaded-first',
    };

    const { shared: registeredShared } =
      getRegisteredShare(
        // @ts-ignore
        shareScopeMap,
        'react',
        shareInfoRes,
        {
          emit: () => undefined,
        },
      ) || {};
    assert(registeredShared, 'must get registeredShared');
    expect(registeredShared.from).toEqual('host');
    // @ts-ignore
    res();
  });

  it('get loaded shared if it has been loaded and sharedStrategy is "loaded-first"', () => {
    const shareScopeMap = {
      default: {
        react: {
          '18.2.0': {
            deps: [],
            useIn: [],
            from: 'host',
            get: () => {
              //noop
            },
            loaded: true,
            lib: {},
            loading: Promise.resolve(),
            version: '18.2.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.2.0',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
          '18.3.1': {
            deps: [],
            useIn: [],
            from: 'remote',
            loaded: undefined,
            get: () => {
              //noop
            },
            loading: null,
            version: '18.3.1',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.3.1',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
        },
      },
    };

    const shareInfoRes = {
      deps: [],
      useIn: [],
      from: 'remote',
      loaded: undefined,
      get: () => {
        //noop
      },
      loading: null,
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        fixedDependencies: false,
        requiredVersion: '18.3.1',
        strictVersion: false,
        singleton: true,
        eager: false,
      },
      strategy: 'loaded-first',
    };

    const { shared: registeredShared } =
      getRegisteredShare(
        // @ts-ignore
        shareScopeMap,
        'react',
        shareInfoRes,
        {
          emit: () => undefined,
        },
      ) || {};
    assert(registeredShared, 'must get registeredShared');
    expect(registeredShared.from).toEqual('host');
  });

  it('get max version shared if all registered shared no loaded or loading and sharedStrategy is "loaded-first"', () => {
    const shareScopeMap = {
      default: {
        react: {
          '18.2.0': {
            deps: [],
            useIn: [],
            from: 'host',
            get: () => {
              //noop
            },
            loaded: undefined,
            lib: undefined,
            loading: null,
            version: '18.2.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.2.0',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
          '18.3.1': {
            deps: [],
            useIn: [],
            from: 'remote',
            loaded: undefined,
            get: () => {
              //noop
            },
            loading: null,
            version: '18.3.1',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.3.1',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
        },
      },
    };

    const shareInfoRes = {
      deps: [],
      useIn: [],
      from: 'remote',
      loaded: undefined,
      get: () => {
        //noop
      },
      loading: null,
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        fixedDependencies: false,
        requiredVersion: '18.3.1',
        strictVersion: false,
        singleton: true,
        eager: false,
      },
      strategy: 'loaded-first',
    };

    const { shared: registeredShared } =
      getRegisteredShare(
        // @ts-ignore
        shareScopeMap,
        'react',
        shareInfoRes,
        {
          emit: () => undefined,
        },
      ) || {};
    assert(registeredShared, 'must get registeredShared');
    expect(registeredShared.from).toEqual('remote');
  });

  it('gets the highest compatible non-singleton shared version regardless of registration order', () => {
    const createShared = (version: string, treeShaking = false) => ({
      deps: [],
      useIn: [],
      from: `v${version}`,
      get: () => {
        //noop
      },
      loaded: false,
      loading: null,
      version,
      scope: ['default'],
      shareConfig: {
        requiredVersion: '^1.0.0',
        singleton: false,
        eager: false,
        strictVersion: false,
      },
      strategy: 'version-first' as const,
      ...(treeShaking
        ? {
            treeShaking: {
              status: TreeShakingStatus.CALCULATED,
            },
          }
        : {}),
    });

    const getSelectedVersion = (versions: string[], treeShaking = false) => {
      const { shared } =
        getRegisteredShare(
          // @ts-ignore
          {
            default: {
              example: Object.fromEntries(
                versions.map((version) => [
                  version,
                  createShared(version, treeShaking),
                ]),
              ),
            },
          },
          'example',
          createShared('consumer', treeShaking),
          {
            emit: () => undefined,
          },
        ) || {};

      assert(shared, 'must get registered shared');
      return shared.version;
    };

    const orders = [
      ['1.0.0', '1.9.0', '2.0.0'],
      ['1.9.0', '1.0.0', '2.0.0'],
    ];

    orders.forEach((versions) => {
      expect(getSelectedVersion(versions)).toEqual('1.9.0');
      expect(getSelectedVersion(versions, true)).toEqual('1.9.0');
    });
  });
});
