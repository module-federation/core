/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
} from './shared-test-utils';

jest.setTimeout(15000);

describe('ConsumeSharedPlugin - alias fallback respects issuerLayer', () => {
  function makeEnv() {
    const afterResolveHook = { tapPromise: jest.fn() };
    const createModuleHook = { tapPromise: jest.fn() };

    const normalModuleFactory: any = {
      hooks: {
        factorize: { tapPromise: jest.fn() },
        createModule: createModuleHook,
        afterResolve: afterResolveHook,
      },
    };

    const mockResolver = {
      withOptions: jest.fn().mockReturnThis(),
      resolve: jest.fn((_ignored, _ctx, _req, _rctx, cb) =>
        cb(null, '/abs/node_modules/next/dist/compiled/react/index.js'),
      ),
    };

    const mockCompilation: any = {
      dependencyFactories: new Map(),
      hooks: {
        finishModules: {
          tap: jest.fn(),
          tapAsync: jest.fn((_name, cb) => cb([], jest.fn())),
        },
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
      },
      resolverFactory: { get: jest.fn().mockReturnValue(mockResolver) },
      addRuntimeModule: jest.fn(),
      addModule: jest.fn(),
      moduleGraph: { getModule: jest.fn() },
      contextDependencies: { addAll: jest.fn() },
      fileDependencies: { addAll: jest.fn() },
      missingDependencies: { addAll: jest.fn() },
      compiler: { context: '/proj' },
    };

    const compiler: any = {
      context: '/proj',
      hooks: {
        thisCompilation: {
          tap: jest.fn((_name, cb) =>
            cb(mockCompilation, { normalModuleFactory }),
          ),
        },
      },
    };

    return {
      compiler,
      mockCompilation,
      normalModuleFactory,
      afterResolveHook,
      createModuleHook,
      mockResolver,
    };
  }

  it('skips mapping when cfg.issuerLayer mismatches active issuerLayer', async () => {
    const env = makeEnv();
    // Configure plugin with aliasConsumption on
    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      experiments: { aliasConsumption: true } as any,
      consumes: {
        // define a consume entry in a different layer
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'default',
          requiredVersion: false,
          issuerLayer: 'layer-B',
          layer: 'layer-B',
        },
      },
    } as any);

    // Patch internal unresolvedConsumes via resolveMatchedConfigs mock
    const {
      resolveMatchedConfigs,
    } = require('../../../../src/lib/sharing/resolveMatchedConfigs');
    const cfgB = {
      request: 'react',
      shareKey: 'react',
      shareScope: 'default',
      requiredVersion: false,
      issuerLayer: 'layer-B',
      layer: 'layer-B',
    };
    (resolveMatchedConfigs as jest.Mock).mockResolvedValue({
      resolved: new Map(),
      unresolved: new Map([['(layer-B)react', cfgB]]),
      prefixed: new Map(),
    });

    // Ensure getDescriptionFile resolves immediately (no package.json walk needed)
    mockGetDescriptionFile.mockImplementation((_fs, _dir, _names, cb) =>
      cb(null, null),
    );

    plugin.apply(env.compiler);

    // Extract afterResolve callback
    expect(env.afterResolveHook.tapPromise).toHaveBeenCalled();
    const afterResolveCb = env.afterResolveHook.tapPromise.mock.calls[0][1];

    // Call afterResolve for a module issued in layer-A
    await afterResolveCb({
      request: 'react',
      contextInfo: { issuerLayer: 'layer-A' },
      createData: {
        resource: '/abs/node_modules/next/dist/compiled/react/index.js',
      },
    });

    // Now simulate createModule; because mapping was skipped, createModule should not create ConsumeSharedModule
    const createModuleCb =
      env.normalModuleFactory.hooks.createModule.tapPromise.mock.calls[0][1];
    const result = await createModuleCb(
      { resource: '/abs/node_modules/next/dist/compiled/react/index.js' },
      { context: '/proj', dependencies: [{}] },
    );
    expect(result).toBeUndefined();
  });

  it('maps only the cfg with matching issuerLayer when multiple exist', async () => {
    const env = makeEnv();
    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      experiments: { aliasConsumption: true } as any,
      consumes: {
        reactA: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'default',
          requiredVersion: false,
          issuerLayer: 'layer-A',
          layer: 'layer-A',
        },
        reactB: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'default',
          requiredVersion: false,
          issuerLayer: 'layer-B',
          layer: 'layer-B',
        },
      },
    } as any);

    const {
      resolveMatchedConfigs,
    } = require('../../../../src/lib/sharing/resolveMatchedConfigs');
    const cfgA = {
      request: 'react',
      shareKey: 'react',
      shareScope: 'default',
      requiredVersion: false,
      issuerLayer: 'layer-A',
      layer: 'layer-A',
    };
    const cfgB = {
      request: 'react',
      shareKey: 'react',
      shareScope: 'default',
      requiredVersion: false,
      issuerLayer: 'layer-B',
      layer: 'layer-B',
    };
    (resolveMatchedConfigs as jest.Mock).mockResolvedValue({
      resolved: new Map(),
      unresolved: new Map([
        ['(layer-A)react', cfgA],
        ['(layer-B)react', cfgB],
      ]),
      prefixed: new Map(),
    });

    mockGetDescriptionFile.mockImplementation((_fs, _dir, _names, cb) =>
      cb(null, null),
    );

    plugin.apply(env.compiler);
    const afterResolveCb = env.afterResolveHook.tapPromise.mock.calls[0][1];
    await afterResolveCb({
      request: 'react',
      contextInfo: { issuerLayer: 'layer-A' },
      createData: {
        resource: '/abs/node_modules/next/dist/compiled/react/index.js',
      },
    });

    // Now createModule should create the consume-shared module (mocked)
    const createModuleCb =
      env.normalModuleFactory.hooks.createModule.tapPromise.mock.calls[0][1];
    const result = await createModuleCb(
      { resource: '/abs/node_modules/next/dist/compiled/react/index.js' },
      { context: '/proj', dependencies: [{}] },
    );
    // The mocked factory returns a plain object; we just assert it returned something truthy
    expect(result).toBeDefined();
    // And ensure our resolver was asked
    expect(env.mockResolver.resolve).toHaveBeenCalled();
  });
});
