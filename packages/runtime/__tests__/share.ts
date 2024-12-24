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
  react: [
    {
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
  ],
  'react-dom': [
    {
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
  ],
};

export const arrayShared = {
  name: '@federation/array-shared',
  remotes: [],
  shared: {
    'react-dom': [
      {
        version: '16.0.0',
        scope: ['default', 'sub2'],
        get: () =>
          Promise.resolve(() => ({
            default: 'react-dom',
            version: '16.0.0',
            from: '@federation/array-shared',
          })),
      },
      {
        version: '17.0.0',
        scope: ['default', 'sub2'],
        get: () =>
          Promise.resolve(() => ({
            default: 'react-dom',
            version: '17.0.0',
            from: '@federation/array-shared',
          })),
      },
    ],
  },
};

export const arraySharedInfos = {
  'react-dom': arrayShared.shared['react-dom'],
};

export const shareInfoWithoutLibAndGetConsumer = {
  name: '@federation/shared-config-consumer',
  remotes: [],
  shared: {
    'react-dom': {
      scope: ['default'],
      shareConfig: {
        singleton: true,
        requiredVersion: '^16.0.0',
        eager: false,
      },
    },
  },
};

export const shareInfoWithoutLibAndGetProvider = {
  name: '@federation/shared-config-provider',
  remotes: [],
  shared: {
    'react-dom': {
      version: '16.0.0',
      scope: ['default'],
      get: () =>
        Promise.resolve(() => ({
          default: 'react-dom',
          version: '16.0.0',
          from: '@federation/shared-config-provider',
        })),
    },
  },
};

export const layeredShareInfo1 = {
  name: '@federation/layered-shared1',
  remotes: [],
  shared: {
    react: {
      version: '16.0.0',
      scope: ['default'],
      shareConfig: {
        singleton: true,
        requiredVersion: '^16.0.0',
        eager: false,
        layer: 'base',
      },
      get: () =>
        Promise.resolve(() => ({
          default: 'react',
          version: '16.0.0',
          from: '@federation/layered-shared1',
          layer: 'base',
        })),
    },
  },
};

export const layeredShareInfo2 = {
  name: '@federation/layered-shared2',
  remotes: [],
  shared: {
    react: {
      version: '16.0.1',
      scope: ['default'],
      shareConfig: {
        singleton: true,
        requiredVersion: '^16.0.0',
        eager: false,
        layer: 'base',
      },
      get: () =>
        Promise.resolve(() => ({
          default: 'react',
          version: '16.0.1',
          from: '@federation/layered-shared2',
          layer: 'base',
        })),
    },
  },
};

export const layeredArrayShared = {
  name: '@federation/layered-array-shared',
  remotes: [],
  shared: {
    react: [
      {
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
            from: '@federation/layered-array-shared',
          })),
      },
      {
        version: '16.0.1',
        scope: ['default'],
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          layer: 'base',
        },
        get: () =>
          Promise.resolve(() => ({
            default: 'react',
            version: '16.0.1',
            from: '@federation/layered-array-shared',
            layer: 'base',
          })),
      },
      {
        version: '16.0.2',
        scope: ['default'],
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          layer: 'base',
        },
        get: () =>
          Promise.resolve(() => ({
            default: 'react',
            version: '16.0.2',
            from: '@federation/layered-array-shared',
            layer: 'base',
          })),
      },
    ],
  },
};

export const nonLayeredShareInfo = {
  name: '@federation/non-layered-shared',
  remotes: [],
  shared: {
    react: {
      version: '16.0.2',
      scope: ['default'],
      shareConfig: {
        singleton: true,
        requiredVersion: '^16.0.0',
        eager: false,
      },
      get: () =>
        Promise.resolve(() => ({
          default: 'react',
          version: '16.0.2',
          from: '@federation/non-layered-shared',
        })),
    },
  },
};

export const layeredSemverShared = {
  name: '@federation/layered-semver-shared',
  remotes: [],
  shared: {
    react: [
      {
        // Base layer, v16
        version: '16.0.0',
        scope: ['default'],
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          eager: false,
          layer: 'base',
        },
        get: () =>
          Promise.resolve(() => ({
            default: 'react',
            version: '16.0.0',
            from: '@federation/layered-semver-shared',
            layer: 'base',
          })),
      },
      {
        // Base layer, v17
        version: '17.0.0',
        scope: ['default'],
        shareConfig: {
          singleton: true,
          requiredVersion: '^17.0.0',
          eager: false,
          layer: 'base',
        },
        get: () =>
          Promise.resolve(() => ({
            default: 'react',
            version: '17.0.0',
            from: '@federation/layered-semver-shared',
            layer: 'base',
          })),
      },
      {
        // Base layer, v17 patch
        version: '17.0.1',
        scope: ['default'],
        shareConfig: {
          singleton: true,
          requiredVersion: '^17.0.0',
          eager: false,
          layer: 'base',
        },
        get: () =>
          Promise.resolve(() => ({
            default: 'react',
            version: '17.0.1',
            from: '@federation/layered-semver-shared',
            layer: 'base',
          })),
      },
      {
        // Non-layered version
        version: '18.0.0',
        scope: ['default'],
        shareConfig: {
          singleton: true,
          requiredVersion: '^18.0.0',
          eager: false,
        },
        get: () =>
          Promise.resolve(() => ({
            default: 'react',
            version: '18.0.0',
            from: '@federation/layered-semver-shared',
          })),
      },
    ],
  },
};
