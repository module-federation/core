import { assert, describe, it } from 'vitest';
import { init } from '../src/index';
import {
  mergeShareInfo1,
  mergeShareInfo2,
  mergeShareInfo3,
  localMergeShareInfos,
  arrayShared,
  arraySharedInfos,
  shareInfoWithoutLibAndGetConsumer,
  shareInfoWithoutLibAndGetProvider,
} from './share';
// import { assert } from '../src/utils/logger';
import { FederationHost } from '@module-federation/runtime-core';
import {
  UserOptions,
  ShareScopeMap,
  Options,
} from '@module-federation/runtime-core/types';
import {
  Global,
  setGlobalFederationConstructor,
} from '@module-federation/runtime-core';

// eslint-disable-next-line max-lines-per-function
// TODO: add new load share test cases
describe('shared', () => {
  beforeEach(() => {
    __FEDERATION__.__SHARE__ = {};
  });

  it('init merge shared', () => {
    const FederationInstance = init(mergeShareInfo1);
    const FederationInstance2 = init(mergeShareInfo2);
    init(mergeShareInfo3);
    expect(FederationInstance).toBe(FederationInstance2);
    expect(FederationInstance.options.shared).toMatchObject(
      localMergeShareInfos,
    );
  });

  it('init array shared', () => {
    const FederationInstance = init(arrayShared);
    expect(FederationInstance.options.shared).toMatchObject(arraySharedInfos);
  });

  it('init shared without lib and get', async () => {
    const provider = init(shareInfoWithoutLibAndGetProvider);

    await provider.loadShare<{
      version: string;
      from: string;
    }>('react-dom');

    const consumer = init(shareInfoWithoutLibAndGetConsumer);
    consumer.initShareScopeMap('default', provider.shareScopeMap['default']);

    const reactDomInstance = await consumer.loadShare<{
      version: string;
      from: string;
    }>('react-dom');
    assert(reactDomInstance);
    const reactDomInstanceRes = reactDomInstance();
    assert(reactDomInstanceRes, "reactInstance can't be undefined");
    expect(reactDomInstanceRes.from).toBe('@federation/shared-config-provider');
    expect(reactDomInstanceRes.version).toBe('16.0.0');
  });

  it('loadShare singleton', async () => {
    const gmConfig1 = {
      name: '@federation/loadShare',
      remotes: [],
      shared: {
        'singleton-react': {
          version: '16.0.0',
          get: () =>
            new Promise<() => { version: string; from: string }>((resolve) => {
              setTimeout(() => {
                resolve(() => ({
                  version: '16.0.0',
                  from: '@federation/loadShare',
                }));
              }, 500);
            }),
        },
      },
    };
    const gmConfig2 = {
      name: '@federation/loadShare2',
      remotes: [],
      shared: {
        'singleton-react': {
          version: '16.0.1',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
          get: () =>
            new Promise<() => { version: string; from: string }>((resolve) => {
              setTimeout(() => {
                resolve(() => ({
                  version: '16.0.0',
                  from: '@federation/loadShare2',
                }));
              }, 600);
            }),
        },
      },
    };

    const FederationInstance = new FederationHost(gmConfig1);
    const FederationInstance2 = new FederationHost(gmConfig2);

    const reactInstance = await FederationInstance.loadShare<{
      version: string;
      from: string;
    }>('singleton-react');
    assert(reactInstance);
    const reactInstanceRes = reactInstance();
    assert(reactInstanceRes, "reactInstance can't be undefined");
    expect(reactInstanceRes.from).toBe('@federation/loadShare');
    expect(reactInstanceRes.version).toBe('16.0.0');

    const reactInstance2 = await FederationInstance2.loadShare<{
      version: string;
      from: string;
    }>('singleton-react');
    assert(reactInstance2);
    const reactInstance2Res = reactInstance2();
    assert(reactInstance2Res, "reactInstance can't be undefined");
    expect(reactInstance2Res.from).toBe('@federation/loadShare2');
    expect(reactInstance2Res.version).toBe('16.0.0');
  });

  it('loadShare cache', async () => {
    // Repeat requests to avoid creating multiple instances
    let uniqueId = 0;
    const gmConfig1 = {
      name: '@federation/loadshare-cache',
      remotes: [],
      shared: {
        react: {
          version: '16.0.0',
          get: () =>
            new Promise<() => { version: string; from: string }>((resolve) => {
              setTimeout(() => {
                uniqueId++;
                resolve(() => ({
                  version: '16.0.0',
                  from: '@federation/loadshare-cache',
                  uniqueId,
                }));
              }, 500);
            }),
        },
      },
    };

    const FederationInstance = new FederationHost(gmConfig1);

    const [reactInstance1, reactInstance2] = await Promise.all([
      FederationInstance.loadShare<{
        version: string;
        from: string;
        uniqueId: number;
      }>('react'),
      FederationInstance.loadShare<{
        version: string;
        from: string;
        uniqueId: number;
      }>('react'),
    ]);
    assert(reactInstance1);
    assert(reactInstance2);
    const reactInstance1Res = reactInstance1();
    const reactInstance2Res = reactInstance2();
    assert(reactInstance1Res, "reactInstance1 can't be undefined");
    assert(reactInstance2Res, "reactInstance2 can't be undefined");
    expect(reactInstance1Res.uniqueId).toBe(1);
    expect(reactInstance2Res.uniqueId).toBe(1);
    expect(reactInstance1Res).toStrictEqual(reactInstance2Res);
  });

  it('runtime inject deps', async () => {
    const runtimeReact = () => {
      return { from: '@federation/runtime-deps' };
    };

    const gmConfig1 = {
      name: '@federation/runtime-deps',
      remotes: [],
      shared: {
        // 'runtime-react': {
        //   version: '16.0.0',
        //   lib: runtimeReact,
        // },
      },
    };

    const gmConfig2 = {
      name: '@federation/runtime-deps2',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.2',
          shareConfig: {
            requiredVersion: '^16.0.0',
            singleton: false,
          },
          get: async () => () => {
            return { from: '@federation/runtime-deps2' };
          },
        },
      },
    };

    const GM1 = new FederationHost(gmConfig1);
    GM1.initOptions({
      name: '@federation/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          lib: runtimeReact,
        },
      },
    });
    await GM1.loadShare<{ from: string; version: string }>('runtime-react');
    const FederationInstance2 = new FederationHost(gmConfig2);
    const shared = await FederationInstance2.loadShare<{
      from: string;
      version: string;
    }>('runtime-react');
    assert(shared);
    const sharedRes = shared();
    assert(sharedRes, "shared can't be null");
    expect(sharedRes.from).toEqual('@federation/runtime-deps2');
  });

  // it('share deps', async () => {
  //   const GM1 = new FederationHost({
  //     name: '@federation/load-deps',
  //     remotes: [],
  //     shared: {
  //       'deps-react': {
  //         version: '1.0.0',
  //         get: () =>
  //           new Promise(resolve => {
  //             setTimeout(() => {
  //               resolve({
  //                 from: ['deps-react'],
  //               });
  //             }, 300);
  //           }),
  //       },
  //       'deps-react-dom': {
  //         version: '1.0.1',
  //         deps: ['deps-react'],
  //         get: () =>
  //           new Promise(async resolve => {
  //             const reactDeps =
  //               GM1.loadShareSync<{ from: Array<string> }>('deps-react');

  //             setTimeout(() => {
  //               resolve({
  //                 from: [...reactDeps.from, 'deps-react-dom'],
  //               });
  //             }, 200);
  //           }),
  //       },
  //     },
  //   });

  //   const shareInstance = await GM1.loadShare<{ from: Array<string> }>(
  //     'deps-react-dom',
  //   );

  //   assert(shareInstance, "shareInstance can'n be undefined");
  //   expect(shareInstance.from).toEqual(
  //     expect.arrayContaining(['deps-react', 'deps-react-dom']),
  //   );
  // });
});

describe('single shared', () => {
  beforeEach(() => {
    __FEDERATION__.__SHARE__ = {};
  });
  it('major version', async () => {
    const vmConfig1 = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          lib: () => {
            return { from: '@shared-single/runtime-deps' };
          },
        },
      },
    };

    const vmConfig2 = {
      name: '@shared-single/runtime-deps2',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '17.0.2',
          shareConfig: {
            requiredVersion: '^17.0.0',
            singleton: true,
          },
          get: async () => () => {
            return { from: '@shared-single/runtime-deps2' };
          },
        },
      },
    };

    const vmConfig3 = {
      name: '@shared-single/runtime-deps3',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '18.0.0',
          shareConfig: {
            requiredVersion: '^18.0.0',
            singleton: false,
          },
          lib: () => {
            return { from: '@shared-single/runtime-deps3' };
          },
        },
      },
    };

    const FM1 = new FederationHost(vmConfig1);
    await FM1.loadShare<{ from: string; version: string }>('runtime-react');
    const FM3 = new FederationHost(vmConfig3);
    await FM3.loadShare<{ from: string; version: string }>('runtime-react');

    const FM2 = new FederationHost(vmConfig2);
    const shared = await FM2.loadShare<{ from: string; version: string }>(
      'runtime-react',
    );
    assert(shared);
    const sharedRes = shared();
    assert(sharedRes, "shared can't be null");
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps2');
  });
});

describe('eager shared', () => {
  beforeEach(() => {
    __FEDERATION__.__SHARE__ = {};
  });

  it('load eager shared first', async () => {
    const federationConfig1 = {
      name: '@module-federation/eager-shared1',
      remotes: [],
      shared: {
        'eager-react': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            eager: true,
          },
          lib: () => ({
            name: 'eager-react-ins1',
            version: '16.0.0',
          }),
        },
      },
    };

    const federationConfig2 = {
      name: '@module-federation/eager-shared2',
      remotes: [],
      shared: {
        'eager-react': {
          version: '16.0.1',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            eager: true,
          },
          lib: () => ({
            name: 'eager-react-ins2',
            version: '16.0.1',
          }),
        },
      },
    };

    const FM = new FederationHost(federationConfig1);
    const FM2 = new FederationHost(federationConfig2);

    const reactInstanceFactory = FM.loadShareSync<{
      version: string;
      name: string;
    }>('eager-react');
    const reactInstanceRes = reactInstanceFactory();
    assert(reactInstanceRes, "reactInstance can't be undefined");
    expect(reactInstanceRes.version).toBe('16.0.0');

    const reactInstance2 = FM2.loadShareSync<{
      version: string;
      name: string;
    }>('eager-react');
    const reactInstance2Res = reactInstance2();

    assert(reactInstance2Res, "reactInstance can't be undefined");
    expect(reactInstance2Res.version).toBe('16.0.1');
  });

  it('load self shared module while globalShare not have expected shared module', async () => {
    const federationConfig1 = {
      name: '@module-federation/eager-shared1',
      remotes: [],
      shared: {
        'none-eager-react': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            eager: true,
          },
          get: async () => () => ({
            name: 'eager-react-ins1',
            version: '16.0.0',
          }),
        },
      },
    };

    const federationConfig2 = {
      name: '@module-federation/eager-shared2',
      remotes: [],
      shared: {
        'eager-react': {
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            eager: true,
          },
          version: '16.0.1',
          lib: () => ({
            name: 'eager-react-ins2',
            version: '16.0.1',
          }),
        },
      },
    };

    const FM = new FederationHost(federationConfig1);
    const FM2 = new FederationHost(federationConfig2);

    const reactInstance2 = FM2.loadShareSync<{
      version: string;
      name: string;
    }>('eager-react');
    const reactInstance2Res = reactInstance2();
    assert(reactInstance2Res, "reactInstance can't be undefined");
    expect(reactInstance2Res.version).toBe('16.0.1');
  });

  it('throw err while get function return promise', async () => {
    const federationConfig1 = {
      name: '@module-federation/eager-shared1',
      remotes: [],
      shared: {
        'none-eager-react': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            eager: true,
          },
          get: async () => () => ({
            name: 'none-eager-react',
            version: '16.0.0',
          }),
        },
      },
    };
    const FM = new FederationHost(federationConfig1);

    expect(function () {
      FM.loadShareSync<{
        version: string;
        name: string;
      }>('none-eager-react');
    }).toThrowError('Invalid loadShareSync');
  });
});

describe('strictVersion shared', () => {
  it('throw error while strictVersion is true, singleton is true and requiredVersion can not match. ', async () => {
    const federationConfig1 = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          // shareConfig: {},
          get: async () => () => {
            return { from: '@shared-single/runtime-deps2' };
          },
        },
      },
    };

    const federationConfig2 = {
      name: '@shared-single/runtime-deps2',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '17.0.2',
          shareConfig: {
            strictVersion: true,
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          lib: () => {
            return { from: '@shared-single/runtime-deps' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const FM2 = new FederationHost(federationConfig2);

    await FM1.loadShare<{ from: string; version: string }>('runtime-react');
    FM2.initShareScopeMap('default', FM1.shareScopeMap['default']);

    expect(function () {
      FM2.loadShareSync<{
        version: string;
        name: string;
      }>('runtime-react');
    }).toThrowError('[ Federation Runtime ]: Version');
  });

  it('use self shared first , if strictVersion is true, singleton is false , requiredVersion is false ', async () => {
    const federationConfig1 = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          // shareConfig: {},
          lib: () => {
            return { from: '@shared-single/runtime-deps' };
          },
        },
      },
    };

    const federationConfig2: UserOptions = {
      name: '@shared-single/runtime-deps2',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '17.0.2',
          shareConfig: {
            strictVersion: true,
            singleton: false,
            requiredVersion: false,
          },
          get: async () => () => {
            return { from: '@shared-single/runtime-deps2' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const FM2 = new FederationHost(federationConfig2);

    await FM1.loadShare<{ from: string; version: string }>('runtime-react');
    FM2.initShareScopeMap('default', FM1.shareScopeMap['default']);

    const shared = await FM2.loadShare<{ from: string; version: string }>(
      'runtime-react',
    );
    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "shared can't be null");
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps');
  });
});

describe('with shareScope shared', () => {
  it('use the same shareScope existed shared', async () => {
    const existedShareScopeMap: ShareScopeMap = {
      default: {
        'runtime-react': {
          '16.0.1': {
            version: '16.0.1',
            get: () => () => {
              return { from: '@shared-single/runtime-deps3' };
            },
            lib: () => {
              return { from: '@shared-single/runtime-deps3' };
            },
            shareConfig: {
              requiredVersion: false,
              singleton: true,
              eager: false,
              strictVersion: false,
            },
            scope: ['default'],
            useIn: ['@shared-single/runtime-deps3'],
            from: '@shared-single/runtime-deps3',
            deps: [],
            strategy: 'version-first',
          },
        },
      },
      old: {
        'runtime-react': {
          '16.0.2': {
            version: '16.0.2',
            get: () => () => {
              return { from: '@shared-single/runtime-deps2' };
            },
            lib: () => {
              return { from: '@shared-single/runtime-deps2' };
            },
            shareConfig: {
              requiredVersion: false,
              singleton: true,
              eager: false,
              strictVersion: false,
            },
            scope: ['old'],
            useIn: ['@shared-single/runtime-deps2'],
            from: '@shared-single/runtime-deps2',
            deps: [],
            strategy: 'version-first',
          },
        },
      },
    };

    const federationConfig1: UserOptions = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          scope: 'default',
          lib: () => {
            return { from: '@shared-single/runtime-deps' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    // initShareScopeMap will be called while container.init execute
    FM1.initShareScopeMap('default', existedShareScopeMap['default']);

    const shared = await FM1.loadShare<{ from: string; version: string }>(
      'runtime-react',
    );
    assert(shared, "shared can't be null");

    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps3');
  });

  it('use the specify shareScope shared', async () => {
    const existedShareScopeMap: ShareScopeMap = {
      default: {
        'runtime-react': {
          '16.0.1': {
            version: '16.0.1',
            get: () => () => {
              return { from: '@shared-single/runtime-deps3' };
            },
            lib: () => {
              return { from: '@shared-single/runtime-deps3' };
            },
            shareConfig: {
              requiredVersion: false,
              singleton: true,
              eager: false,
              strictVersion: false,
            },
            scope: ['default'],
            useIn: ['@shared-single/runtime-deps3'],
            from: '@shared-single/runtime-deps3',
            deps: [],
            strategy: 'version-first',
          },
        },
      },
      old: {
        'runtime-react': {
          '16.0.2': {
            version: '16.0.2',
            get: () => () => {
              return { from: '@shared-single/runtime-deps2' };
            },
            lib: () => {
              return { from: '@shared-single/runtime-deps2' };
            },
            shareConfig: {
              requiredVersion: false,
              singleton: true,
              eager: false,
              strictVersion: false,
            },
            scope: ['old'],
            useIn: ['@shared-single/runtime-deps2'],
            from: '@shared-single/runtime-deps2',
            deps: [],
            strategy: 'version-first',
          },
        },
      },
    };

    const federationConfig1: UserOptions = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          scope: 'old',
          lib: () => {
            return { from: '@shared-single/runtime-deps' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    // initShareScopeMap will be called while container.init execute
    FM1.initShareScopeMap('old', existedShareScopeMap['old']);

    const shared = await FM1.loadShare<{ from: string; version: string }>(
      'runtime-react',
    );
    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    // default strategy is version-first, so the priority @shared-single/runtime-deps2 > @shared-single/runtime-deps
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps2');
  });
});

describe('load share with customize consume info', () => {
  it('return false while not matched shared', async () => {
    const federationConfig1: UserOptions = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          scope: 'default',
          lib: () => {
            return { from: '@shared-single/runtime-deps' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const shared = await FM1.loadShare<{ from: string }>('runtime-react');
    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps');

    const sharedWithCustomInfo = await FM1.loadShare('runtime-react', {
      customShareInfo: {
        shareConfig: {
          requiredVersion: '>17',
          singleton: false,
        },
      },
    });
    console.log(sharedWithCustomInfo);
    expect(sharedWithCustomInfo).toEqual(false);
  });
});

describe('load share with different strategy', () => {
  it('register all shared to shareScopeMap while strategy is "version-first"', async () => {
    setGlobalFederationConstructor(FederationHost, true);

    const federationConfig1: UserOptions = {
      name: '@shared-test/app1',
      remotes: [
        {
          name: '__FEDERATION_@federation-test/version-strategy-app2:custom__',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/version-strategy-app2/federation-remote-entry.js',
        },
      ],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          scope: 'default',
          strategy: 'version-first',
          get: () => () => {
            return { from: '@shared-test/app1' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const shared = await FM1.loadShare<{ from: string }>('runtime-react');

    // should register remote shared to share scope map
    expect(
      Object.keys(FM1.shareScopeMap['default']['runtime-react']).length > 1,
    ).toEqual(true);

    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.from).toEqual('@shared-test/version-strategy-app2');

    Global.__FEDERATION__.__INSTANCES__ = [];
    setGlobalFederationConstructor(undefined, true);
  });

  it('register only self shared to shareScopeMap while strategy is "loaded-first"', async () => {
    setGlobalFederationConstructor(FederationHost, true);

    const federationConfig1: UserOptions = {
      name: '@shared-test/app1',
      remotes: [
        {
          name: '__FEDERATION_@federation-test/version-strategy-app2:custom__',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/version-strategy-app2/federation-remote-entry.js',
        },
      ],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          scope: 'default',
          strategy: 'loaded-first',
          get: () => () => {
            return { from: '@shared-test/app1' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const shared = await FM1.loadShare<{ from: string }>('runtime-react');

    // should not register remote shared to share scope map
    expect(
      Object.keys(FM1.shareScopeMap['default']['runtime-react']).length === 1,
    ).toEqual(true);

    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.from).toEqual('@shared-test/app1');

    Global.__FEDERATION__.__INSTANCES__ = [];
    setGlobalFederationConstructor(undefined, true);
  });
});

describe('load share while shared has multiple versions', () => {
  it('return loaded and has max version shared by default', async () => {
    const federationConfig1: UserOptions = {
      name: '@shared/multiple-versions',
      remotes: [],
      shared: {
        'runtime-react': [
          {
            version: '16.0.0',
            scope: 'default',
            // pass lib means the shared has loaded
            lib: () => {
              return { from: '@shared/multiple-versions', version: '16.0.0' };
            },
          },
          {
            version: '17.0.0',
            scope: 'default',
            get: async () => () => {
              return { from: '@shared/multiple-versions', version: '17.0.0' };
            },
          },
        ],
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const shared = await FM1.loadShare<{ version: string }>('runtime-react');
    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.version).toEqual('16.0.0');
  });

  it('return specify shared with resolver', async () => {
    const federationConfig1: UserOptions = {
      name: '@shared/multiple-versions',
      remotes: [],
      shared: {
        'runtime-react': [
          {
            version: '17.0.0',
            scope: 'default',
            // pass lib means the shared has loaded
            lib: () => {
              return { from: '@shared/multiple-versions', version: '17.0.0' };
            },
          },
          {
            version: '16.0.0',
            scope: 'default',
            get: async () => () => {
              return { from: '@shared/multiple-versions', version: '16.0.0' };
            },
          },
        ],
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const shared = await FM1.loadShare<{ version: string }>('runtime-react', {
      resolver: (sharedOptions) => {
        return (
          sharedOptions.find((i) => i.version === '16.0.0') ?? sharedOptions[0]
        );
      },
    });
    assert(shared, "shared can't be null");
    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.version).toEqual('16.0.0');
  });
});
