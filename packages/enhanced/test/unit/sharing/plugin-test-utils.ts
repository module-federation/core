import {
  shareScopes,
  createSharingTestEnvironment,
  createMockFederationCompiler,
  testModuleOptions,
  createMockCompiler,
  createMockCompilation,
  createWebpackMock,
  createModuleMock,
} from './utils';

export {
  shareScopes,
  createSharingTestEnvironment,
  createMockFederationCompiler,
  testModuleOptions,
  createMockCompiler,
  createMockCompilation,
};

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path: string) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

const federationRuntimePluginMock = jest.fn().mockImplementation(() => ({
  apply: jest.fn(),
}));

const registerModuleVariant = (modulePath: string, factory: () => unknown) => {
  jest.mock(modulePath, factory as any);
  jest.mock(`${modulePath}.ts`, factory as any);
};

registerModuleVariant(
  '../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => federationRuntimePluginMock,
);

const mockConsumeSharedModule = jest
  .fn()
  .mockImplementation((contextOrOptions, options) => {
    const actualOptions = options || contextOrOptions;

    return {
      shareScope: actualOptions.shareScope,
      name: actualOptions.name || 'default-name',
      request: actualOptions.request || 'default-request',
      eager: actualOptions.eager || false,
      strictVersion: actualOptions.strictVersion || false,
      singleton: actualOptions.singleton || false,
      requiredVersion:
        actualOptions.requiredVersion !== undefined
          ? actualOptions.requiredVersion
          : '1.0.0',
      getVersion: jest
        .fn()
        .mockReturnValue(
          actualOptions.requiredVersion !== undefined
            ? actualOptions.requiredVersion
            : '1.0.0',
        ),
      options: actualOptions,
      build: jest.fn().mockImplementation((ctx, _c, _r, _f, callback) => {
        callback && callback();
      }),
    };
  });

registerModuleVariant(
  '../../../src/lib/sharing/ConsumeSharedModule',
  () => mockConsumeSharedModule,
);

const mockConsumeSharedRuntimeModule = jest
  .fn()
  .mockImplementation(() => ({ name: 'ConsumeSharedRuntimeModule' }));

const mockShareRuntimeModule = jest
  .fn()
  .mockImplementation(() => ({ name: 'ShareRuntimeModule' }));

registerModuleVariant(
  '../../../src/lib/sharing/ConsumeSharedRuntimeModule',
  () => mockConsumeSharedRuntimeModule,
);

registerModuleVariant(
  '../../../src/lib/sharing/ShareRuntimeModule',
  () => mockShareRuntimeModule,
);

class MockConsumeSharedFallbackDependency {
  constructor(
    public fallbackRequest: string,
    public shareScope: string,
    public requiredVersion: string,
  ) {}
}

function consumeSharedFallbackFactory() {
  return function (
    fallbackRequest: string,
    shareScope: string,
    requiredVersion: string,
  ) {
    return new MockConsumeSharedFallbackDependency(
      fallbackRequest,
      shareScope,
      requiredVersion,
    );
  };
}

jest.mock(
  '../../../src/lib/sharing/ConsumeSharedFallbackDependency',
  () => consumeSharedFallbackFactory(),
  { virtual: true },
);

jest.mock(
  '../../../src/lib/sharing/ConsumeSharedFallbackDependency.ts',
  () => consumeSharedFallbackFactory(),
  { virtual: true },
);

const resolveMatchedConfigs = jest.fn();

registerModuleVariant('../../../src/lib/sharing/resolveMatchedConfigs', () => ({
  resolveMatchedConfigs,
}));

export const mockGetDescriptionFile = jest.fn();

jest.mock('../../../src/lib/sharing/utils.ts', () => ({
  ...jest.requireActual('../../../src/lib/sharing/utils.ts'),
  getDescriptionFile: mockGetDescriptionFile,
}));

export const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;

export function createTestConsumesConfig(consumes = {}) {
  return {
    shareScope: shareScopes.string,
    consumes,
  };
}

export function createMockResolver() {
  return {
    resolve: jest.fn(),
    withOptions: jest.fn().mockReturnThis(),
  };
}

export function resetAllMocks() {
  jest.clearAllMocks();
  mockGetDescriptionFile.mockReset();
  resolveMatchedConfigs.mockReset();
  resolveMatchedConfigs.mockResolvedValue({
    resolved: new Map(),
    unresolved: new Map(),
    prefixed: new Map(),
  });
  mockConsumeSharedModule.mockClear();
}

export { mockConsumeSharedModule, resolveMatchedConfigs };

const webpack = createWebpackMock();
const Module = createModuleMock(webpack);

export { webpack, Module };

class MockProvideSharedDependency {
  constructor(
    public request: string,
    public shareScope: string | string[],
    public version: string,
  ) {
    this._shareScope = shareScope;
    this._version = version;
    this._shareKey = request;
  }

  _shareScope: string | string[];
  _version: string;
  _shareKey: string;
}

jest.mock(
  '../../../src/lib/sharing/ProvideSharedDependency',
  () => MockProvideSharedDependency,
);

jest.mock('../../../src/lib/sharing/ProvideSharedModuleFactory', () =>
  jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
);

jest.mock('../../../src/lib/sharing/ProvideSharedModule', () =>
  jest.fn().mockImplementation((options) => ({
    _shareScope: options.shareScope,
    _shareKey: options.shareKey || options.request,
    _version: options.version,
    _eager: options.eager || false,
    options,
  })),
);

export const ProvideSharedPlugin =
  require('../../../src/lib/sharing/ProvideSharedPlugin').default;

export { MockProvideSharedDependency };

export const testProvides = {
  react: {
    shareKey: 'react',
    shareScope: shareScopes.string,
    version: '17.0.2',
    eager: false,
  },
  lodash: {
    version: '4.17.21',
    singleton: true,
  },
  vue: {
    shareKey: 'vue',
    shareScope: shareScopes.array,
    version: '3.2.37',
    eager: true,
  },
};

export function createTestModule(overrides = {}) {
  return {
    ...testModuleOptions,
    ...overrides,
  };
}

export function createTestConfig(
  provides = testProvides,
  shareScope = shareScopes.string,
) {
  return {
    shareScope,
    provides,
  };
}
