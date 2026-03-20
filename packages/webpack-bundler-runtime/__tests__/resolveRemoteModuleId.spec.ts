import { resolveRemoteModuleId } from '../src/resolveRemoteModuleId';

describe('resolveRemoteModuleId', () => {
  test('resolves wrapper module id by alias and expose', () => {
    const webpackRequire = {
      remotesLoadingData: {
        moduleIdToRemoteDataMapping: {
          'webpack/container/remote/rscRemote/./Dialog': {
            name: './Dialog',
            remoteName: 'rscRemote',
          },
        },
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            remoteInfos: {
              rscRemote: [{ name: 'rscRemote' }],
            },
          },
        },
      },
    } as any;

    expect(
      resolveRemoteModuleId({
        webpackRequire,
        alias: 'rscRemote',
        expose: './Dialog',
      }),
    ).toBe('webpack/container/remote/rscRemote/./Dialog');
  });

  test('matches expose with and without ./ prefix', () => {
    const webpackRequire = {
      remotesLoadingData: {
        moduleIdToRemoteDataMapping: {
          'webpack/container/remote/rscRemote/./Dialog': {
            name: './Dialog',
            remoteName: 'rscRemote',
          },
        },
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            remoteInfos: {
              rscRemote: [{ name: 'rscRemote' }],
            },
          },
        },
      },
    } as any;

    expect(
      resolveRemoteModuleId({
        webpackRequire,
        alias: 'rscRemote',
        expose: 'Dialog',
      }),
    ).toBe('webpack/container/remote/rscRemote/./Dialog');
  });

  test('supports alias->remoteName mapping from remoteInfos', () => {
    const webpackRequire = {
      remotesLoadingData: {
        moduleIdToRemoteDataMapping: {
          'webpack/container/remote/app2/./Dialog': {
            name: './Dialog',
            remoteName: 'app2',
          },
        },
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            remoteInfos: {
              rscRemote: [{ name: 'app2' }],
            },
          },
        },
      },
    } as any;

    expect(
      resolveRemoteModuleId({
        webpackRequire,
        alias: 'rscRemote',
        expose: './Dialog',
      }),
    ).toBe('webpack/container/remote/app2/./Dialog');
  });

  test('returns undefined when mapping is ambiguous', () => {
    const webpackRequire = {
      remotesLoadingData: {
        moduleIdToRemoteDataMapping: {
          'webpack/container/remote/rscRemote/./DialogA': {
            name: './Dialog',
            remoteName: 'rscRemote',
          },
          'webpack/container/remote/rscRemote/./DialogB': {
            name: './Dialog',
            remoteName: 'rscRemote',
          },
        },
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            remoteInfos: {
              rscRemote: [{ name: 'rscRemote' }],
            },
          },
        },
      },
    } as any;

    expect(
      resolveRemoteModuleId({
        webpackRequire,
        alias: 'rscRemote',
        expose: './Dialog',
      }),
    ).toBeUndefined();
  });
});
