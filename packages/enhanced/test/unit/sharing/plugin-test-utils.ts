import { rs } from '@rstest/core';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
// This ensures mocks are set up BEFORE any imports that use them
const mocks = rs.hoisted(() => ({
  mockNormalizeWebpackPath: rs.fn((path: string) => path),
  mockGetWebpackPath: rs.fn(() => 'mocked-webpack-path'),
  mockFederationRuntimePluginApply: rs.fn(),
  mockFederationRuntimePlugin: rs.fn(),
}));

// Configure mockFederationRuntimePlugin AFTER rs.hoisted()
mocks.mockFederationRuntimePlugin.mockImplementation(() => ({
  apply: mocks.mockFederationRuntimePluginApply,
}));

// Mock must be set up before importing modules that use normalizeWebpackPath
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
  getWebpackPath: mocks.mockGetWebpackPath,
}));

// Export for external usage
export const federationRuntimePluginMock = mocks.mockFederationRuntimePlugin;

// Now it's safe to import modules that may use normalizeWebpackPath
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

rs.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => ({
  __esModule: true,
  default: federationRuntimePluginMock,
}));
rs.mock(
  '../../../src/lib/container/runtime/FederationRuntimePlugin.ts',
  () => ({
    __esModule: true,
    default: federationRuntimePluginMock,
  }),
);

const mockConsumeSharedModule = rs
  .fn()
  .mockImplementation(
    (
      contextOrOptions: Record<string, unknown>,
      options?: Record<string, unknown>,
    ) => {
      const actualOptions = options || contextOrOptions;

      return {
        shareScope: actualOptions['shareScope'],
        name: actualOptions['name'] || 'default-name',
        request: actualOptions['request'] || 'default-request',
        eager: actualOptions['eager'] || false,
        strictVersion: actualOptions['strictVersion'] || false,
        singleton: actualOptions['singleton'] || false,
        requiredVersion:
          actualOptions['requiredVersion'] !== undefined
            ? actualOptions['requiredVersion']
            : '1.0.0',
        getVersion: rs
          .fn()
          .mockReturnValue(
            actualOptions['requiredVersion'] !== undefined
              ? actualOptions['requiredVersion']
              : '1.0.0',
          ),
        options: actualOptions,
        build: rs
          .fn()
          .mockImplementation(
            (
              _ctx: unknown,
              _c: unknown,
              _r: unknown,
              _f: unknown,
              callback?: () => void,
            ) => {
              callback && callback();
            },
          ),
      };
    },
  );

rs.mock('../../../src/lib/sharing/ConsumeSharedModule', () => ({
  __esModule: true,
  default: mockConsumeSharedModule,
}));
rs.mock('../../../src/lib/sharing/ConsumeSharedModule.ts', () => ({
  __esModule: true,
  default: mockConsumeSharedModule,
}));

const mockConsumeSharedRuntimeModule = rs
  .fn()
  .mockImplementation(() => ({ name: 'ConsumeSharedRuntimeModule' }));

const mockShareRuntimeModule = rs
  .fn()
  .mockImplementation(() => ({ name: 'ShareRuntimeModule' }));

rs.mock('../../../src/lib/sharing/ConsumeSharedRuntimeModule', () => ({
  __esModule: true,
  default: mockConsumeSharedRuntimeModule,
}));
rs.mock('../../../src/lib/sharing/ConsumeSharedRuntimeModule.ts', () => ({
  __esModule: true,
  default: mockConsumeSharedRuntimeModule,
}));

rs.mock('../../../src/lib/sharing/ShareRuntimeModule', () => ({
  __esModule: true,
  default: mockShareRuntimeModule,
}));
rs.mock('../../../src/lib/sharing/ShareRuntimeModule.ts', () => ({
  __esModule: true,
  default: mockShareRuntimeModule,
}));

class MockConsumeSharedFallbackDependency {
  constructor(
    public fallbackRequest: string,
    public shareScope: string,
    public requiredVersion: string,
  ) {}
}

rs.mock('../../../src/lib/sharing/ConsumeSharedFallbackDependency', () => ({
  __esModule: true,
  default: MockConsumeSharedFallbackDependency,
}));

rs.mock('../../../src/lib/sharing/ConsumeSharedFallbackDependency.ts', () => ({
  __esModule: true,
  default: MockConsumeSharedFallbackDependency,
}));

const resolveMatchedConfigs = rs.fn();

rs.mock('../../../src/lib/sharing/resolveMatchedConfigs', () => ({
  resolveMatchedConfigs,
}));
rs.mock('../../../src/lib/sharing/resolveMatchedConfigs.ts', () => ({
  resolveMatchedConfigs,
}));

export const mockGetDescriptionFile = rs.fn();

// Mock utility functions from src/lib/sharing/utils.ts
// We mock these fully instead of using rs.requireActual to avoid loading the real module
// which depends on normalizeWebpackPath
const mockCreateLookupKeyForSharing = (
  request: string,
  layer?: string | null,
): string => {
  if (layer) {
    return `(${layer})${request}`;
  }
  return request;
};

const mockExtractPathAfterNodeModules = (filePath: string): string | null => {
  if (~filePath.indexOf('node_modules')) {
    const nodeModulesIndex = filePath.lastIndexOf('node_modules');
    const result = filePath.substring(nodeModulesIndex + 13);
    return result;
  }
  return null;
};

const mockTestRequestFilters = (
  remainder: string,
  includeRequest?: string | RegExp,
  excludeRequest?: string | RegExp,
): boolean => {
  if (
    includeRequest &&
    !(includeRequest instanceof RegExp
      ? includeRequest.test(remainder)
      : remainder === includeRequest)
  ) {
    return false;
  }
  if (
    excludeRequest &&
    (excludeRequest instanceof RegExp
      ? excludeRequest.test(remainder)
      : remainder === excludeRequest)
  ) {
    return false;
  }
  return true;
};

// Mock addSingletonFilterWarning that actually adds warnings to compilation
const mockAddSingletonFilterWarning = rs
  .fn()
  .mockImplementation(
    (
      compilation: any,
      shareKey: string,
      filterType: 'include' | 'exclude',
      filterProperty: 'request' | 'version',
      filterValue: string | RegExp,
      moduleRequest: string,
      moduleResource?: string,
    ) => {
      if (typeof compilation?.warnings?.push !== 'function') {
        return;
      }
      const filterValueStr =
        filterValue instanceof RegExp
          ? filterValue.toString()
          : `"${filterValue}"`;
      const warningMessage = `"singleton: true" is used together with "${filterType}.${filterProperty}: ${filterValueStr}". This might lead to multiple instances of the shared module "${shareKey}" in the shared scope.`;
      const warning = {
        message: warningMessage,
        file: moduleResource
          ? `shared module ${moduleRequest} -> ${moduleResource}`
          : `shared module ${moduleRequest}`,
      };
      compilation.warnings.push(warning);
    },
  );

const mockNormalizeVersion = (versionDesc: string): string => {
  versionDesc = (versionDesc && versionDesc.trim()) || '';
  return versionDesc;
};

const mockGetRequiredVersionFromDescriptionFile = (
  data: Record<string, any>,
  packageName: string,
): string | undefined | void => {
  if (
    data['optionalDependencies'] &&
    typeof data['optionalDependencies'] === 'object' &&
    packageName in data['optionalDependencies']
  ) {
    return mockNormalizeVersion(data['optionalDependencies'][packageName]);
  }
  if (
    data['dependencies'] &&
    typeof data['dependencies'] === 'object' &&
    packageName in data['dependencies']
  ) {
    return mockNormalizeVersion(data['dependencies'][packageName]);
  }
  if (
    data['peerDependencies'] &&
    typeof data['peerDependencies'] === 'object' &&
    packageName in data['peerDependencies']
  ) {
    return mockNormalizeVersion(data['peerDependencies'][packageName]);
  }
  if (
    data['devDependencies'] &&
    typeof data['devDependencies'] === 'object' &&
    packageName in data['devDependencies']
  ) {
    return mockNormalizeVersion(data['devDependencies'][packageName]);
  }
};

const mockNormalizeConsumeShareOptions = (consumeOptions: any) => {
  const {
    requiredVersion = false,
    strictVersion,
    singleton = false,
    eager,
    shareKey,
    shareScope,
    layer,
  } = consumeOptions;
  return {
    shareConfig: {
      fixedDependencies: false,
      requiredVersion,
      strictVersion,
      singleton,
      eager,
      layer,
    },
    shareScope,
    shareKey,
  };
};

rs.mock('../../../src/lib/sharing/utils.ts', () => ({
  getDescriptionFile: mockGetDescriptionFile,
  createLookupKeyForSharing: mockCreateLookupKeyForSharing,
  extractPathAfterNodeModules: mockExtractPathAfterNodeModules,
  testRequestFilters: mockTestRequestFilters,
  addSingletonFilterWarning: mockAddSingletonFilterWarning,
  normalizeVersion: mockNormalizeVersion,
  getRequiredVersionFromDescriptionFile:
    mockGetRequiredVersionFromDescriptionFile,
  normalizeConsumeShareOptions: mockNormalizeConsumeShareOptions,
}));

rs.mock('../../../src/lib/sharing/utils', () => ({
  getDescriptionFile: mockGetDescriptionFile,
  createLookupKeyForSharing: mockCreateLookupKeyForSharing,
  extractPathAfterNodeModules: mockExtractPathAfterNodeModules,
  testRequestFilters: mockTestRequestFilters,
  addSingletonFilterWarning: mockAddSingletonFilterWarning,
  normalizeVersion: mockNormalizeVersion,
  getRequiredVersionFromDescriptionFile:
    mockGetRequiredVersionFromDescriptionFile,
  normalizeConsumeShareOptions: mockNormalizeConsumeShareOptions,
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
    resolve: rs.fn(),
    withOptions: rs.fn().mockReturnThis(),
  };
}

export function resetAllMocks() {
  rs.clearAllMocks();
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

rs.mock('../../../src/lib/sharing/ProvideSharedDependency', () => ({
  __esModule: true,
  default: MockProvideSharedDependency,
}));

// Define mock functions BEFORE rs.mock() calls (mock factories are hoisted)
const mockProvideSharedModuleFactoryCreate = rs.fn();

// Create a mock class that can be instantiated with `new`
class MockProvideSharedModuleFactory {
  create = mockProvideSharedModuleFactoryCreate;
}

const mockProvideSharedModule = rs.fn().mockImplementation((options: any) => ({
  _shareScope: options.shareScope,
  _shareKey: options.shareKey || options.request,
  _version: options.version,
  _eager: options.eager || false,
  options,
}));

rs.mock('../../../src/lib/sharing/ProvideSharedModuleFactory', () => ({
  __esModule: true,
  default: MockProvideSharedModuleFactory,
}));

rs.mock('../../../src/lib/sharing/ProvideSharedModule', () => ({
  __esModule: true,
  default: mockProvideSharedModule,
}));

export const ProvideSharedPlugin =
  require('../../../src/lib/sharing/ProvideSharedPlugin').default;

export { MockProvideSharedDependency, MockProvideSharedModuleFactory };

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
