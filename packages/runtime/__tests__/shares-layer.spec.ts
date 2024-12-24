import { describe, it, expect, assert } from 'vitest';
import { init } from '../src/index';
import { ShareStrategy } from '../src/type';
import { FederationHost } from '../src/core';
import { ShareScopeMap, UserOptions } from '../src/type';

describe('layered shared with FederationHost', () => {
  beforeEach(() => {
    __FEDERATION__.__SHARE__ = {};
  });

  it('should load layered share with version matching', async () => {
    const vmConfig1 = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          lib: () => {
            return { from: '@shared-single/runtime-deps', layer: undefined };
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
            layer: 'base',
          },
          get: async () => () => {
            return { from: '@shared-single/runtime-deps2', layer: 'base' };
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
            layer: 'feature',
          },
          lib: () => {
            return { from: '@shared-single/runtime-deps3', layer: 'feature' };
          },
        },
      },
    };

    const FM1 = new FederationHost(vmConfig1);
    await FM1.loadShare<{ from: string; version: string; layer?: string }>(
      'runtime-react',
    );
    const FM3 = new FederationHost(vmConfig3);
    await FM3.loadShare<{ from: string; version: string; layer?: string }>(
      'runtime-react',
    );

    const FM2 = new FederationHost(vmConfig2);
    const shared = await FM2.loadShare<{
      from: string;
      version: string;
      layer?: string;
    }>('runtime-react', {
      customShareInfo: {
        shareConfig: {
          requiredVersion: '^17.0.0',
          singleton: true,
          layer: 'base',
        },
      },
    });
    assert(shared);
    const sharedRes = shared();
    assert(sharedRes, "shared can't be null");
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps2');
    expect(sharedRes.layer).toEqual('base');
  });

  it('should handle eager layered shares', async () => {
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
            layer: 'base',
          },
          lib: () => ({
            name: 'eager-react-ins1',
            version: '16.0.0',
            layer: 'base',
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
            layer: 'feature',
          },
          lib: () => ({
            name: 'eager-react-ins2',
            version: '16.0.1',
            layer: 'feature',
          }),
        },
      },
    };

    const FM = new FederationHost(federationConfig1);
    const FM2 = new FederationHost(federationConfig2);

    const reactInstanceFactory = FM.loadShareSync<{
      version: string;
      name: string;
      layer: string;
    }>('eager-react');
    const reactInstanceRes = reactInstanceFactory();
    assert(reactInstanceRes, "reactInstance can't be undefined");
    expect(reactInstanceRes.version).toBe('16.0.0');
    expect(reactInstanceRes.layer).toBe('base');

    const reactInstance2 = FM2.loadShareSync<{
      version: string;
      name: string;
      layer: string;
    }>('eager-react');
    const reactInstance2Res = reactInstance2();

    assert(reactInstance2Res, "reactInstance can't be undefined");
    expect(reactInstance2Res.version).toBe('16.0.1');
    expect(reactInstance2Res.layer).toBe('feature');
  });

  it('should handle strict version with layers', async () => {
    const federationConfig1 = {
      name: '@shared-single/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': {
          version: '16.0.0',
          lib: () => {
            return { from: '@shared-single/runtime-deps', layer: 'base' };
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
            layer: 'base',
          },
          lib: () => {
            return { from: '@shared-single/runtime-deps2', layer: 'base' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    const FM2 = new FederationHost(federationConfig2);

    await FM1.loadShare<{ from: string; version: string; layer: string }>(
      'runtime-react',
    );
    FM2.initShareScopeMap('default', FM1.shareScopeMap['default']);
    FM2.initShareScopeMap('(base)default', FM1.shareScopeMap['(base)default']);

    expect(function () {
      FM2.loadShareSync<{
        version: string;
        name: string;
        layer: string;
      }>('runtime-react');
    }).toThrowError('[ Federation Runtime ]: Version');
  });

  it('should handle multiple layers with scope', async () => {
    const existedShareScopeMap: ShareScopeMap = {
      default: {
        'runtime-react': {
          '16.0.1': {
            version: '16.0.1',
            get: () => () => {
              return { from: '@shared-single/runtime-deps3', layer: undefined };
            },
            lib: () => {
              return { from: '@shared-single/runtime-deps3', layer: undefined };
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
      '(base)default': {
        'runtime-react': {
          '16.0.2': {
            version: '16.0.2',
            get: () => () => {
              return { from: '@shared-single/runtime-deps2', layer: 'base' };
            },
            lib: () => {
              return { from: '@shared-single/runtime-deps2', layer: 'base' };
            },
            shareConfig: {
              requiredVersion: false,
              singleton: true,
              eager: false,
              strictVersion: false,
              layer: 'base',
            },
            scope: ['default'],
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
          shareConfig: {
            layer: 'base',
            requiredVersion: '^16.0.0',
          },
          lib: () => {
            return { from: '@shared-single/runtime-deps', layer: 'base' };
          },
        },
      },
    };

    const FM1 = new FederationHost(federationConfig1);
    FM1.initShareScopeMap('default', existedShareScopeMap['default']);
    FM1.initShareScopeMap(
      '(base)default',
      existedShareScopeMap['(base)default'],
    );

    const shared = await FM1.loadShare<{
      from: string;
      version: string;
      layer?: string;
    }>('runtime-react', {
      customShareInfo: {
        shareConfig: {
          layer: 'base',
          requiredVersion: '^16.0.0',
        },
      },
    });
    assert(shared, "shared can't be null");

    const sharedRes = shared();
    assert(sharedRes, "sharedRes can't be null");
    expect(sharedRes.from).toEqual('@shared-single/runtime-deps2');
    expect(sharedRes.layer).toEqual('base');
  });
});

describe('layered shared', () => {
  let federation: any;

  beforeEach(() => {
    __FEDERATION__.__SHARE__ = {};
  });

  it('should not create composite scope when no layers exist', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: {
          version: '16.0.0',
          lib: () => `mock library react at 16.0.0 from @federation/layer-test`,
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
        },
      },
    });

    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(1);
    expect(federation.shareScopeMap['default'].react).toBeDefined();
    expect(federation.shareScopeMap['default'].react['16.0.0']).toBeDefined();
  });

  it('should only register in composite scope when layer exists', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: {
          version: '16.0.0',
          lib: () =>
            `mock library react at 16.0.0 from @federation/layer-test with layer base`,
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    // Both scopes should exist
    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(federation.shareScopeMap).toHaveProperty('(base)default');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(2);

    // Share should only be in layer scope
    expect(federation.shareScopeMap['(base)default'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['16.0.0'],
    ).toBeDefined();
    expect(federation.shareScopeMap['default'].react).toBeUndefined();
  });

  it('should handle mixed layered and non-layered shares correctly', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: [
          {
            version: '16.0.0',
            lib: () =>
              `mock library react at 16.0.0 from @federation/layer-test`,
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
            },
          },
          {
            version: '17.0.0',
            lib: () =>
              `mock library react at 17.0.0 from @federation/layer-test with layer base`,
            shareConfig: {
              singleton: true,
              requiredVersion: '^17.0.0',
              layer: 'base',
            },
          },
        ],
      },
    });

    // Both scopes should exist
    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(federation.shareScopeMap).toHaveProperty('(base)default');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(2);

    // Non-layered share should be in default scope
    expect(federation.shareScopeMap['default'].react).toBeDefined();
    expect(federation.shareScopeMap['default'].react['16.0.0']).toBeDefined();
    expect(federation.shareScopeMap['default'].react['17.0.0']).toBeUndefined();

    // Layered share should be in layer scope
    expect(federation.shareScopeMap['(base)default'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['17.0.0'],
    ).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['16.0.0'],
    ).toBeUndefined();
  });

  it('should respect explicit default scope with no layer', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: {
          version: '16.0.0',
          lib: () => ({
            name: 'react',
            version: '16.0.0',
          }),
          scope: ['default'],
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
        },
      },
    });

    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(1);
    expect(federation.shareScopeMap['default'].react).toBeDefined();
    expect(federation.shareScopeMap['default'].react['16.0.0']).toBeDefined();
  });

  it('should create composite scope when layer exists regardless of explicit scope', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: {
          version: '16.0.0',
          lib: () => ({
            name: 'react',
            version: '16.0.0',
          }),
          scope: ['default'],
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    // Both scopes should exist
    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(federation.shareScopeMap).toHaveProperty('(base)default');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(2);

    // Share should only be in layer scope
    expect(federation.shareScopeMap['(base)default'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['16.0.0'],
    ).toBeDefined();
    expect(federation.shareScopeMap['default'].react).toBeUndefined();
  });

  it('should handle multiple scopes with layer', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: {
          version: '16.0.0',
          lib: () => ({
            name: 'react',
            version: '16.0.0',
          }),
          scope: ['default', 'custom'],
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    // Should create composite scopes for all original scopes
    expect(federation.shareScopeMap).toHaveProperty('(base)default');
    expect(federation.shareScopeMap).toHaveProperty('(base)custom');
    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(federation.shareScopeMap).toHaveProperty('custom');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(4);

    // Share should only be in layer scopes
    expect(federation.shareScopeMap['(base)default'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['16.0.0'],
    ).toBeDefined();
    expect(federation.shareScopeMap['(base)custom'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)custom'].react['16.0.0'],
    ).toBeDefined();
    expect(federation.shareScopeMap['default'].react).toBeUndefined();
    expect(federation.shareScopeMap['custom'].react).toBeUndefined();
  });

  it('should handle array shares with custom scopes and mixed layers', () => {
    federation = init({
      name: '@federation/layer-test',
      remotes: [],
      shared: {
        react: [
          {
            version: '16.0.0',
            lib: () =>
              `mock library react at 16.0.0 from @federation/layer-test`,
            scope: ['default', 'custom'],
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
            },
          },
          {
            version: '17.0.0',
            lib: () =>
              `mock library react at 17.0.0 from @federation/layer-test with layer base`,
            scope: ['default', 'custom'],
            shareConfig: {
              singleton: true,
              requiredVersion: '^17.0.0',
              layer: 'base',
            },
          },
        ],
      },
    });

    // Should create all scopes
    expect(federation.shareScopeMap).toHaveProperty('default');
    expect(federation.shareScopeMap).toHaveProperty('custom');
    expect(federation.shareScopeMap).toHaveProperty('(base)default');
    expect(federation.shareScopeMap).toHaveProperty('(base)custom');
    expect(Object.keys(federation.shareScopeMap)).toHaveLength(4);

    // Non-layered share should be in original scopes
    expect(federation.shareScopeMap['default'].react).toBeDefined();
    expect(federation.shareScopeMap['default'].react['16.0.0']).toBeDefined();
    expect(federation.shareScopeMap['default'].react['17.0.0']).toBeUndefined();
    expect(federation.shareScopeMap['custom'].react).toBeDefined();
    expect(federation.shareScopeMap['custom'].react['16.0.0']).toBeDefined();
    expect(federation.shareScopeMap['custom'].react['17.0.0']).toBeUndefined();

    // Layered share should only be in composite scopes
    expect(federation.shareScopeMap['(base)default'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['17.0.0'],
    ).toBeDefined();
    expect(
      federation.shareScopeMap['(base)default'].react['16.0.0'],
    ).toBeUndefined();
    expect(federation.shareScopeMap['(base)custom'].react).toBeDefined();
    expect(
      federation.shareScopeMap['(base)custom'].react['17.0.0'],
    ).toBeDefined();
    expect(
      federation.shareScopeMap['(base)custom'].react['16.0.0'],
    ).toBeUndefined();
  });
});
describe('layered share loading', () => {
  beforeEach(() => {
    __FEDERATION__.__SHARE__ = {};
  });

  it('should load share from base layer when layer is specified in shareConfig', async () => {
    const provider = init({
      name: '@federation/shared-config-provider',
      remotes: [],
      shared: {
        'react-dom': {
          version: '16.0.0',
          lib: () => ({
            version: '16.0.0',
            from: '@federation/shared-config-provider',
            layer: 'base',
          }),
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    const consumer = init({
      name: '@federation/shared-config-consumer',
      remotes: [],
      shared: {
        'react-dom': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    // Initialize both default and layer scopes
    consumer.initShareScopeMap('default', provider.shareScopeMap['default']);
    consumer.initShareScopeMap(
      '(base)default',
      provider.shareScopeMap['(base)default'],
    );

    const reactDomInstance = await consumer.loadShare<{
      version: string;
      from: string;
      layer: string;
    }>('react-dom', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'base',
        },
      },
    });

    assert(reactDomInstance);
    const reactDomRes = reactDomInstance();
    assert(reactDomRes, "reactDom can't be undefined");
    expect(reactDomRes.from).toBe('@federation/shared-config-provider');
    expect(reactDomRes.version).toBe('16.0.0');
    expect(reactDomRes.layer).toBe('base');
  });

  it('should load shares from different layers based on layer specified in shareConfig', async () => {
    const provider = init({
      name: '@federation/shared-config-provider',
      remotes: [],
      shared: {
        'react-dom': [
          {
            version: '16.0.0',
            lib: () => ({
              version: '16.0.0',
              from: '@federation/shared-config-provider',
              layer: 'base',
            }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'base',
            },
          },
          {
            version: '16.0.1',
            lib: () => ({
              version: '16.0.1',
              from: '@federation/shared-config-provider',
              layer: 'feature',
            }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'feature',
            },
          },
        ],
      },
    });

    const consumerBase = init({
      name: '@federation/shared-config-consumer-base',
      remotes: [],
      shared: {
        'react-dom': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    const consumerFeature = init({
      name: '@federation/shared-config-consumer-feature',
      remotes: [],
      shared: {
        'react-dom': {
          version: '16.0.1',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'feature',
          },
        },
      },
    });

    // Initialize both default and layer scopes for base consumer
    consumerBase.initShareScopeMap(
      'default',
      provider.shareScopeMap['default'],
    );
    consumerBase.initShareScopeMap(
      '(base)default',
      provider.shareScopeMap['(base)default'],
    );

    // Initialize both default and layer scopes for feature consumer
    consumerFeature.initShareScopeMap(
      'default',
      provider.shareScopeMap['default'],
    );
    consumerFeature.initShareScopeMap(
      '(feature)default',
      provider.shareScopeMap['(feature)default'],
    );

    // Load from base layer
    const baseReactDom = await consumerBase.loadShare<{
      version: string;
      from: string;
      layer: string;
    }>('react-dom', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'base',
        },
      },
    });

    assert(baseReactDom);
    const baseReactDomRes = baseReactDom();
    assert(baseReactDomRes, "baseReactDom can't be undefined");
    expect(baseReactDomRes.from).toBe('@federation/shared-config-provider');
    expect(baseReactDomRes.version).toBe('16.0.0');
    expect(baseReactDomRes.layer).toBe('base');

    // Load from feature layer
    const featureReactDom = await consumerFeature.loadShare<{
      version: string;
      from: string;
      layer: string;
    }>('react-dom', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'feature',
        },
      },
    });

    assert(featureReactDom);
    const featureReactDomRes = featureReactDom();
    assert(featureReactDomRes, "featureReactDom can't be undefined");
    expect(featureReactDomRes.from).toBe('@federation/shared-config-provider');
    expect(featureReactDomRes.version).toBe('16.0.1');
    expect(featureReactDomRes.layer).toBe('feature');
  });

  it('should merge layered shares from multiple instances', () => {
    const baseInstance = init({
      name: '@federation/base',
      remotes: [],
      shared: {
        'react-dom': {
          version: '16.0.0',
          lib: () => ({
            version: '16.0.0',
            from: '@federation/base',
            layer: 'base',
          }),
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    // Initialize the feature instance with the same name to ensure merging
    const featureInstance = init({
      name: '@federation/base',
      remotes: [],
      shared: {
        'react-dom': {
          version: '16.0.1',
          lib: () => ({
            version: '16.0.1',
            from: '@federation/feature',
            layer: 'feature',
          }),
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'feature',
          },
        },
      },
    });

    expect(baseInstance).toBe(featureInstance);
    expect(baseInstance.shareScopeMap).toHaveProperty('(base)default');
    expect(baseInstance.shareScopeMap).toHaveProperty('(feature)default');
  });

  it('should handle singleton shares across layers', async () => {
    const provider = init({
      name: '@federation/singleton-provider',
      remotes: [],
      shared: {
        'singleton-react': [
          {
            version: '16.0.0',
            get: () =>
              new Promise<
                () => { version: string; from: string; layer: string }
              >((resolve) => {
                setTimeout(() => {
                  resolve(() => ({
                    version: '16.0.0',
                    from: '@federation/singleton-provider',
                    layer: 'base',
                  }));
                }, 500);
              }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'base',
            },
          },
          {
            version: '16.0.1',
            get: () =>
              new Promise<
                () => { version: string; from: string; layer: string }
              >((resolve) => {
                setTimeout(() => {
                  resolve(() => ({
                    version: '16.0.1',
                    from: '@federation/singleton-provider',
                    layer: 'feature',
                  }));
                }, 500);
              }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'feature',
            },
          },
        ],
      },
    });

    const consumer = init({
      name: '@federation/singleton-consumer',
      remotes: [],
      shared: {
        'singleton-react': [
          {
            version: '16.0.0',
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'base',
            },
          },
          {
            version: '16.0.1',
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'feature',
            },
          },
        ],
      },
    });

    // Initialize both default and layer scopes
    consumer.initShareScopeMap('default', provider.shareScopeMap['default']);
    consumer.initShareScopeMap(
      '(base)default',
      provider.shareScopeMap['(base)default'],
    );
    consumer.initShareScopeMap(
      '(feature)default',
      provider.shareScopeMap['(feature)default'],
    );

    // Register shares in provider's scope maps
    provider.shareScopeMap['(base)default'] = {
      'singleton-react': {
        '16.0.0': {
          ...provider.options.shared['singleton-react'][0],
          loaded: true,
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.0',
              from: '@federation/singleton-provider',
              layer: 'base',
            })),
        },
      },
    };
    provider.shareScopeMap['(feature)default'] = {
      'singleton-react': {
        '16.0.1': {
          ...provider.options.shared['singleton-react'][1],
          loaded: true,
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.1',
              from: '@federation/singleton-provider',
              layer: 'feature',
            })),
        },
      },
    };

    // Initialize consumer's share scopes
    consumer.shareScopeMap['(base)default'] = {
      'singleton-react': {
        '16.0.0': {
          ...provider.shareScopeMap['(base)default']['singleton-react'][
            '16.0.0'
          ],
        },
      },
    };
    consumer.shareScopeMap['(feature)default'] = {
      'singleton-react': {
        '16.0.1': {
          ...provider.shareScopeMap['(feature)default']['singleton-react'][
            '16.0.1'
          ],
        },
      },
    };

    // Load from base layer
    const baseReact = await consumer.loadShare<{
      version: string;
      from: string;
      layer: string;
    }>('singleton-react', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'base',
        },
      },
    });

    assert(baseReact);
    const baseReactRes = baseReact();
    assert(baseReactRes, "baseReact can't be undefined");
    expect(baseReactRes.from).toBe('@federation/singleton-provider');
    expect(baseReactRes.version).toBe('16.0.0');
    expect(baseReactRes.layer).toBe('base');

    // Load from feature layer
    const featureReact = await consumer.loadShare<{
      version: string;
      from: string;
      layer: string;
    }>('singleton-react', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'feature',
        },
      },
    });

    assert(featureReact);
    const featureReactRes = featureReact();
    assert(featureReactRes, "featureReact can't be undefined");
    expect(featureReactRes.from).toBe('@federation/singleton-provider');
    expect(featureReactRes.version).toBe('16.0.1');
    expect(featureReactRes.layer).toBe('feature');
  });

  it('should cache layered shares independently', async () => {
    let baseId = 0;
    let featureId = 0;
    const provider = init({
      name: '@federation/cache-provider',
      remotes: [],
      shared: {
        'cached-react': [
          {
            version: '16.0.0',
            get: () =>
              new Promise<
                () => {
                  version: string;
                  from: string;
                  layer: string;
                  uniqueId: number;
                }
              >((resolve) => {
                setTimeout(() => {
                  baseId++;
                  resolve(() => ({
                    version: '16.0.0',
                    from: '@federation/cache-provider',
                    layer: 'base',
                    uniqueId: baseId,
                  }));
                }, 500);
              }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'base',
            },
          },
          {
            version: '16.0.1',
            get: () =>
              new Promise<
                () => {
                  version: string;
                  from: string;
                  layer: string;
                  uniqueId: number;
                }
              >((resolve) => {
                setTimeout(() => {
                  featureId++;
                  resolve(() => ({
                    version: '16.0.1',
                    from: '@federation/cache-provider',
                    layer: 'feature',
                    uniqueId: featureId,
                  }));
                }, 500);
              }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'feature',
            },
          },
        ],
      },
    });

    // Register shares in provider's scope maps
    provider.shareScopeMap['(base)default'] = {
      'cached-react': {
        '16.0.0': {
          ...provider.options.shared['cached-react'][0],
          loaded: true,
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.0',
              from: '@federation/cache-provider',
              layer: 'base',
              uniqueId: 1,
            })),
        },
      },
    };
    provider.shareScopeMap['(feature)default'] = {
      'cached-react': {
        '16.0.1': {
          ...provider.options.shared['cached-react'][1],
          loaded: true,
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.1',
              from: '@federation/cache-provider',
              layer: 'feature',
              uniqueId: 1,
            })),
        },
      },
    };

    // Load base layer shares in parallel
    const [baseReact1, baseReact2] = await Promise.all([
      provider.loadShare<{
        version: string;
        from: string;
        layer: string;
        uniqueId: number;
      }>('cached-react', {
        customShareInfo: {
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      }),
      provider.loadShare<{
        version: string;
        from: string;
        layer: string;
        uniqueId: number;
      }>('cached-react', {
        customShareInfo: {
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      }),
    ]);

    assert(baseReact1);
    assert(baseReact2);
    const baseReact1Res = baseReact1();
    const baseReact2Res = baseReact2();
    assert(baseReact1Res, "baseReact1 can't be undefined");
    assert(baseReact2Res, "baseReact2 can't be undefined");
    expect(baseReact1Res.uniqueId).toBe(1);
    expect(baseReact2Res.uniqueId).toBe(1);
    expect(baseReact1Res).toStrictEqual(baseReact2Res);

    // Load feature layer shares in parallel
    const [featureReact1, featureReact2] = await Promise.all([
      provider.loadShare<{
        version: string;
        from: string;
        layer: string;
        uniqueId: number;
      }>('cached-react', {
        customShareInfo: {
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'feature',
          },
        },
      }),
      provider.loadShare<{
        version: string;
        from: string;
        layer: string;
        uniqueId: number;
      }>('cached-react', {
        customShareInfo: {
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'feature',
          },
        },
      }),
    ]);

    assert(featureReact1);
    assert(featureReact2);
    const featureReact1Res = featureReact1();
    const featureReact2Res = featureReact2();
    assert(featureReact1Res, "featureReact1 can't be undefined");
    assert(featureReact2Res, "featureReact2 can't be undefined");
    expect(featureReact1Res.uniqueId).toBe(1);
    expect(featureReact2Res.uniqueId).toBe(1);
    expect(featureReact1Res).toStrictEqual(featureReact2Res);

    // Verify base and feature shares are different
    expect(baseReact1Res).not.toStrictEqual(featureReact1Res);
    expect(baseReact1Res.layer).toBe('base');
    expect(featureReact1Res.layer).toBe('feature');
  });

  it('should inject runtime dependencies with layers', async () => {
    const baseReact = () => ({
      from: '@federation/runtime-deps',
      layer: 'base',
    });

    const featureReact = () => ({
      from: '@federation/runtime-deps',
      layer: 'feature',
    });

    const provider = init({
      name: '@federation/runtime-deps',
      remotes: [],
      shared: {},
    });

    provider.initOptions({
      name: '@federation/runtime-deps',
      remotes: [],
      shared: {
        'runtime-react': [
          {
            version: '16.0.0',
            lib: baseReact,
            shareConfig: {
              layer: 'base',
              requiredVersion: '^16.0.0',
            },
          },
          {
            version: '16.0.1',
            lib: featureReact,
            shareConfig: {
              layer: 'feature',
              requiredVersion: '^16.0.0',
            },
          },
        ],
      },
    });

    const consumer = init({
      name: '@federation/runtime-deps-consumer',
      remotes: [],
      shared: {
        'runtime-react': [
          {
            version: '16.0.0',
            shareConfig: {
              requiredVersion: '^16.0.0',
              singleton: false,
              layer: 'base',
            },
          },
          {
            version: '16.0.1',
            shareConfig: {
              requiredVersion: '^16.0.0',
              singleton: false,
              layer: 'feature',
            },
          },
        ],
      },
    });

    // Initialize both default and layer scopes
    consumer.initShareScopeMap('default', provider.shareScopeMap['default']);
    consumer.initShareScopeMap(
      '(base)default',
      provider.shareScopeMap['(base)default'],
    );
    consumer.initShareScopeMap(
      '(feature)default',
      provider.shareScopeMap['(feature)default'],
    );

    // Load base layer
    const baseShare = await consumer.loadShare<{
      from: string;
      layer: string;
    }>('runtime-react', {
      customShareInfo: {
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: false,
          layer: 'base',
        },
      },
    });

    assert(baseShare);
    const baseShareRes = baseShare();
    assert(baseShareRes, "baseShare can't be null");
    expect(baseShareRes.from).toBe('@federation/runtime-deps');
    expect(baseShareRes.layer).toBe('base');

    // Load feature layer
    const featureShare = await consumer.loadShare<{
      from: string;
      layer: string;
    }>('runtime-react', {
      customShareInfo: {
        shareConfig: {
          requiredVersion: '^16.0.0',
          singleton: false,
          layer: 'feature',
        },
      },
    });

    assert(featureShare);
    const featureShareRes = featureShare();
    assert(featureShareRes, "featureShare can't be null");
    expect(featureShareRes.from).toBe('@federation/runtime-deps');
    expect(featureShareRes.layer).toBe('feature');
  });

  it('should handle loading mixed layered and non-layered shares correctly', async () => {
    const provider = init({
      name: '@federation/mixed-provider',
      remotes: [],
      shared: {
        'mixed-react': [
          // Non-layered version
          {
            version: '16.0.0',
            lib: () => ({
              version: '16.0.0',
              from: '@federation/mixed-provider',
              layer: undefined,
            }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
            },
          },
          // Layered version
          {
            version: '16.0.1',
            lib: () => ({
              version: '16.0.1',
              from: '@federation/mixed-provider',
              layer: 'base',
            }),
            shareConfig: {
              singleton: true,
              requiredVersion: '^16.0.0',
              layer: 'base',
            },
          },
        ],
      },
    });

    const consumer = init({
      name: '@federation/mixed-consumer',
      remotes: [],
      shared: {
        'mixed-react': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
        },
      },
    });

    // Initialize scopes
    consumer.initShareScopeMap('default', provider.shareScopeMap['default']);
    consumer.initShareScopeMap(
      '(base)default',
      provider.shareScopeMap['(base)default'],
    );

    // Set up both layered and non-layered shares in the scope map
    consumer.shareScopeMap['default'] = {
      'mixed-react': {
        '16.0.0': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
          scope: ['default'],
          useIn: [],
          deps: [],
          from: '@federation/layered-provider',
          loaded: true,
          strategy: 'version-first',
          lib: () => ({
            version: '16.0.0',
            from: '@federation/layered-provider',
            layer: undefined,
          }),
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.0',
              from: '@federation/layered-provider',
              layer: undefined,
            })),
        },
      },
    };

    consumer.shareScopeMap['(base)default'] = {
      'mixed-react': {
        '16.0.1': {
          version: '16.0.1',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
          scope: ['default'],
          useIn: [],
          deps: [],
          from: '@federation/layered-provider',
          loaded: true,
          strategy: 'version-first',
          lib: () => ({
            version: '16.0.1',
            from: '@federation/layered-provider',
            layer: 'base',
          }),
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.1',
              from: '@federation/layered-provider',
              layer: 'base',
            })),
        },
      },
    };

    // Test 1: Load layered version when both exist
    const layeredShare = await consumer.loadShare<{
      version: string;
      from: string;
      layer: string | undefined;
    }>('mixed-react', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'base',
        },
      },
    });

    assert(layeredShare);
    const layeredRes = layeredShare();
    assert(layeredRes, "layeredShare can't be undefined");
    expect(layeredRes.from).toBe('@federation/layered-provider');
    expect(layeredRes.version).toBe('16.0.1');
    expect(layeredRes.layer).toBe('base');

    // Test 2: Load non-layered version when both exist
    const nonLayeredShare = await consumer.loadShare<{
      version: string;
      from: string;
      layer: string | undefined;
    }>('mixed-react', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
        },
      },
    });

    assert(nonLayeredShare);
    const nonLayeredRes = nonLayeredShare();
    assert(nonLayeredRes, "nonLayeredShare can't be undefined");
    expect(nonLayeredRes.from).toBe('@federation/layered-provider');
    expect(nonLayeredRes.version).toBe('16.0.0');
    expect(nonLayeredRes.layer).toBeUndefined();

    // Test 3: Initialize a provider with only non-layered version
    const nonLayeredOnlyProvider = init({
      name: '@federation/non-layered-provider',
      remotes: [],
      shared: {
        'mixed-react': {
          version: '16.0.0',
          lib: () => ({
            version: '16.0.0',
            from: '@federation/non-layered-provider',
            layer: undefined,
          }),
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
        },
      },
    });

    const nonLayeredConsumer = init({
      name: '@federation/non-layered-consumer',
      remotes: [],
      shared: {
        'mixed-react': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
        },
      },
    });

    // Set up non-layered provider's scope map
    nonLayeredOnlyProvider.shareScopeMap['default'] = {
      'mixed-react': {
        '16.0.0': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
          scope: ['default'],
          useIn: [],
          deps: [],
          from: '@federation/non-layered-provider',
          loaded: true,
          strategy: 'version-first',
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.0',
              from: '@federation/non-layered-provider',
              layer: undefined,
            })),
        },
      },
    };

    nonLayeredConsumer.initShareScopeMap(
      'default',
      nonLayeredOnlyProvider.shareScopeMap['default'],
    );
    nonLayeredConsumer.shareScopeMap['default'] = {
      'mixed-react': {
        '16.0.0': {
          ...nonLayeredOnlyProvider.shareScopeMap['default']['mixed-react'][
            '16.0.0'
          ],
        },
      },
    };

    // Try to load with layer when only non-layered exists
    const nonLayeredOnlyShare = await nonLayeredConsumer.loadShare<{
      version: string;
      from: string;
      layer: string | undefined;
    }>('mixed-react', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'base',
        },
      },
    });

    assert(nonLayeredOnlyShare);
    const nonLayeredOnlyRes = nonLayeredOnlyShare();
    assert(nonLayeredOnlyRes, "nonLayeredOnlyShare can't be undefined");
    expect(nonLayeredOnlyRes.from).toBe('@federation/non-layered-provider');
    expect(nonLayeredOnlyRes.version).toBe('16.0.0');
    expect(nonLayeredOnlyRes.layer).toBeUndefined();

    // Test 4: Initialize a provider with only layered version
    const layeredOnlyProvider = init({
      name: '@federation/layered-provider',
      remotes: [],
      shared: {
        'mixed-react': {
          version: '16.0.1',
          lib: () => ({
            version: '16.0.1',
            from: '@federation/layered-provider',
            layer: 'base',
          }),
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
        },
      },
    });

    const layeredConsumer = init({
      name: '@federation/layered-consumer',
      remotes: [],
      shared: {
        'mixed-react': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
        },
      },
    });

    // Set up layered provider's scope map
    layeredOnlyProvider.shareScopeMap['(base)default'] = {
      'mixed-react': {
        '16.0.1': {
          version: '16.0.1',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
          scope: ['default'],
          useIn: [],
          deps: [],
          from: '@federation/layered-provider',
          loaded: true,
          strategy: 'version-first',
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.1',
              from: '@federation/layered-provider',
              layer: 'base',
            })),
        },
      },
    };

    layeredConsumer.initShareScopeMap(
      'default',
      layeredOnlyProvider.shareScopeMap['default'],
    );
    layeredConsumer.initShareScopeMap(
      '(base)default',
      layeredOnlyProvider.shareScopeMap['(base)default'],
    );

    // Set up both layered and non-layered shares in the scope map
    layeredConsumer.shareScopeMap['default'] = {
      'mixed-react': {
        '16.0.0': {
          version: '16.0.0',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
          },
          scope: ['default'],
          useIn: [],
          deps: [],
          from: '@federation/layered-provider',
          loaded: true,
          strategy: 'version-first',
          lib: () => ({
            version: '16.0.0',
            from: '@federation/layered-provider',
            layer: undefined,
          }),
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.0',
              from: '@federation/layered-provider',
              layer: undefined,
            })),
        },
      },
    };

    layeredConsumer.shareScopeMap['(base)default'] = {
      'mixed-react': {
        '16.0.1': {
          version: '16.0.1',
          shareConfig: {
            singleton: true,
            requiredVersion: '^16.0.0',
            layer: 'base',
          },
          scope: ['default'],
          useIn: [],
          deps: [],
          from: '@federation/layered-provider',
          loaded: true,
          strategy: 'version-first',
          lib: () => ({
            version: '16.0.1',
            from: '@federation/layered-provider',
            layer: 'base',
          }),
          get: () =>
            Promise.resolve(() => ({
              version: '16.0.1',
              from: '@federation/layered-provider',
              layer: 'base',
            })),
        },
      },
    };

    // Try to load with layer when only layered exists
    const layeredOnlyShare = await layeredConsumer.loadShare<{
      version: string;
      from: string;
      layer: string | undefined;
    }>('mixed-react', {
      customShareInfo: {
        shareConfig: {
          singleton: true,
          requiredVersion: '^16.0.0',
          layer: 'base',
        },
        get: () =>
          Promise.resolve(() => ({
            version: '16.0.1',
            from: '@federation/layered-provider',
            layer: 'base',
          })),
      },
    });

    assert(layeredOnlyShare);
    const layeredOnlyRes = layeredOnlyShare();
    assert(layeredOnlyRes, "layeredOnlyShare can't be undefined");
    expect(layeredOnlyRes.from).toBe('@federation/layered-provider');
    expect(layeredOnlyRes.version).toBe('16.0.1');
    expect(layeredOnlyRes.layer).toBe('base');
  });
});
