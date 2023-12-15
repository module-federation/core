import { assert, describe, it } from 'vitest';
import { init } from '../src/index';
import { getGlobalShareScope } from '../src/utils/share';
import {
  mergeShareInfo1,
  mergeShareInfo2,
  mergeShareInfo3,
  localMergeShareInfos,
} from './share';
import { DEFAULT_SCOPE } from '../src/constant';
// import { assert } from '../src/utils/logger';
import { FederationHost } from '../src/core';

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
    const reactInstanceRes = reactInstance();
    assert(reactInstanceRes, "reactInstance can't be undefined");
    expect(reactInstanceRes.from).toBe('@federation/loadShare');
    expect(reactInstanceRes.version).toBe('16.0.0');

    const reactInstance2 = await FederationInstance2.loadShare<{
      version: string;
      from: string;
    }>('singleton-react');
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
    const reactInstance1Res = reactInstance1();
    const reactInstance2Res = reactInstance2();
    assert(reactInstance1Res, "reactInstance1 can't be undefined");
    assert(reactInstance2Res, "reactInstance2 can't be undefined");
    expect(reactInstance1Res.uniqueId).toBe(2);
    expect(reactInstance2Res.uniqueId).toBe(2);
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
    }).toThrowError('The loadShareSync');
  });
});
