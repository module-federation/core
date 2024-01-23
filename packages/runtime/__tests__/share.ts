import { GlobalShareScopeMap, Options } from '../src/type';
export const mergeShareInfo1 = {
  name: '@federation/merge-shared',
  remotes: [],
  shared: {
    react: {
      version: '16.0.0',
      scope: ['default'],
      shareConfig: {
        singleton: true,
        requiredVersion: '^16.0.0',
        eager: false,
      },
      get: () =>
        Promise.resolve(() => ({
          default: 'react',
          version: '16.0.0',
          from: '@federation/merge-shared',
        })),
    },
  },
};

export const mergeShareInfo2 = {
  name: '@federation/merge-shared',
  remotes: [],
  shared: {
    'react-dom': {
      version: '17.0.0',
      scope: ['default', 'sub2'],
      get: () =>
        Promise.resolve(() => ({
          default: 'react-dom',
          version: '17.0.0',
          from: '@federation/merge-shared',
        })),
    },
  },
};

export const mergeShareInfo3 = {
  name: '@federation/merge-shared3',
  remotes: [],
  shared: {
    'react-dom': {
      version: '16.0.0',
      scope: ['default', 'sub2'],
      get: () =>
        Promise.resolve(() => ({
          default: 'react-dom',
          version: '16.0.0',
          from: '@federation/merge-shared3',
        })),
    },
  },
};

export const localMergeShareInfos: Options['shared'] = {
  react: {
    version: '16.0.0',
    from: mergeShareInfo1.name,
    get: mergeShareInfo1.shared.react.get,
    shareConfig: {
      singleton: true,
      requiredVersion: '^16.0.0',
      eager: false,
    },
    scope: ['default'],
    useIn: [],
    deps: [],
    strategy: 'version-first',
  },
  'react-dom': {
    version: '17.0.0',
    from: mergeShareInfo2.name,
    get: mergeShareInfo2.shared['react-dom'].get,
    shareConfig: {
      singleton: false,
      requiredVersion: '^17.0.0',
      eager: false,
    },
    scope: ['default', 'sub2'],
    useIn: [],
    deps: [],
    strategy: 'version-first',
  },
};
