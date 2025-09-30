/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
} from './shared-test-utils';

jest.setTimeout(15000);

describe('ConsumeSharedPlugin - alias fallback preserves import=false semantics', () => {
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

  it('does not rewrite import when cfg.import === false', async () => {
    const env = makeEnv();
    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      experiments: { aliasConsumption: true } as any,
      consumes: {
        react: {
          import: false,
          shareKey: 'react',
          shareScope: 'default',
          requiredVersion: false,
          issuerLayer: 'layer-A',
          layer: 'layer-A',
        },
      },
    } as any);

    // Configure unresolved consume so alias fallback path runs
    const {
      resolveMatchedConfigs,
    } = require('../../../../src/lib/sharing/resolveMatchedConfigs');
    const cfg = {
      request: 'react',
      shareKey: 'react',
      shareScope: 'default',
      requiredVersion: false,
      issuerLayer: 'layer-A',
      layer: 'layer-A',
      import: false,
    };
    (resolveMatchedConfigs as jest.Mock).mockResolvedValue({
      resolved: new Map(),
      unresolved: new Map([['(layer-A)react', cfg]]),
      prefixed: new Map(),
    });

    mockGetDescriptionFile.mockImplementation((_fs, _dir, _names, cb) =>
      cb(null, null),
    );

    plugin.apply(env.compiler);

    // afterResolve should map the resource to our consume config without changing import=false
    const afterResolveCb = env.afterResolveHook.tapPromise.mock.calls[0][1];
    await afterResolveCb({
      request: 'react',
      contextInfo: { issuerLayer: 'layer-A' },
      createData: {
        resource: '/abs/node_modules/next/dist/compiled/react/index.js',
      },
    });

    // createModule should create a ConsumeSharedModule with options.import strictly false
    const createModuleCb =
      env.normalModuleFactory.hooks.createModule.tapPromise.mock.calls[0][1];
    const result: any = await createModuleCb(
      { resource: '/abs/node_modules/next/dist/compiled/react/index.js' },
      { context: '/proj', dependencies: [{}] },
    );

    expect(result).toBeDefined();
    expect(result.options).toBeDefined();
    // Must not be rewritten to a string fallback path
    expect(typeof result.options.import === 'string').toBe(false);
    // Either undefined or false is acceptable for remote-only consumes
    expect([undefined, false]).toContain(result.options.import);
  });
});
