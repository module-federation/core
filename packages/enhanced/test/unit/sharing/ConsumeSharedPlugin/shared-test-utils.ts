/*
 * Shared test utilities and mocks for ConsumeSharedPlugin tests
 */

import {
  shareScopes,
  createSharingTestEnvironment,
  createFederationCompilerMock,
  testModuleOptions,
} from '../utils';

// Create webpack mock
export const webpack = { version: '5.89.0' };

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

// Note: Removed container-utils mock as the function doesn't exist in the codebase

// Mock container dependencies with commonjs support
jest.mock('../../../../src/lib/container/ContainerExposedDependency', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    name: 'ContainerExposedDependency',
  })),
}));

jest.mock('../../../../src/lib/container/ContainerEntryModule', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    name: 'ContainerEntryModule',
  })),
}));

// Mock FederationRuntimePlugin
jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => {
    return jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    }));
  },
);

// Create mock ConsumeSharedModule
export const createMockConsumeSharedModule = () => {
  const mockConsumeSharedModule = jest
    .fn()
    .mockImplementation((contextOrOptions, options) => {
      // Handle both calling patterns:
      // 1. Direct test calls: mockConsumeSharedModule(options)
      // 2. Plugin calls: mockConsumeSharedModule(context, options)
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
        // Add necessary methods expected by the plugin
        build: jest.fn().mockImplementation((context, _c, _r, _f, callback) => {
          callback && callback();
        }),
      };
    });

  return mockConsumeSharedModule;
};

// Create shared module mock
export const mockConsumeSharedModule = createMockConsumeSharedModule();

// Mock ConsumeSharedModule
jest.mock('../../../../src/lib/sharing/ConsumeSharedModule', () => {
  return mockConsumeSharedModule;
});

// Create runtime module mocks
const mockConsumeSharedRuntimeModule = jest.fn().mockImplementation(() => ({
  name: 'ConsumeSharedRuntimeModule',
}));

const mockShareRuntimeModule = jest.fn().mockImplementation(() => ({
  name: 'ShareRuntimeModule',
}));

// Mock runtime modules
jest.mock('../../../../src/lib/sharing/ConsumeSharedRuntimeModule', () => {
  return mockConsumeSharedRuntimeModule;
});

jest.mock('../../../../src/lib/sharing/ShareRuntimeModule', () => {
  return mockShareRuntimeModule;
});

// Mock ConsumeSharedFallbackDependency
class MockConsumeSharedFallbackDependency {
  constructor(
    public fallbackRequest: string,
    public shareScope: string,
    public requiredVersion: string,
  ) {}
}

jest.mock(
  '../../../../src/lib/sharing/ConsumeSharedFallbackDependency',
  () => {
    return function (fallbackRequest, shareScope, requiredVersion) {
      return new MockConsumeSharedFallbackDependency(
        fallbackRequest,
        shareScope,
        requiredVersion,
      );
    };
  },
  { virtual: true },
);

// Mock resolveMatchedConfigs
jest.mock('../../../../src/lib/sharing/resolveMatchedConfigs', () => ({
  resolveMatchedConfigs: jest.fn().mockResolvedValue({
    resolved: new Map(),
    unresolved: new Map(),
    prefixed: new Map(),
  }),
}));

// Mock utils module with a spy-like setup for getDescriptionFile
export const mockGetDescriptionFile = jest.fn();
jest.mock('../../../../src/lib/sharing/utils', () => ({
  ...jest.requireActual('../../../../src/lib/sharing/utils'),
  getDescriptionFile: mockGetDescriptionFile,
}));

// Import after mocks are set up
export const ConsumeSharedPlugin =
  require('../../../../src/lib/sharing/ConsumeSharedPlugin').default;
export const {
  resolveMatchedConfigs,
} = require('../../../../src/lib/sharing/resolveMatchedConfigs');

// Re-export utilities
export {
  shareScopes,
  createSharingTestEnvironment,
  createFederationCompilerMock,
};

// Helper function to create test configuration
export function createTestConsumesConfig(consumes = {}) {
  return {
    shareScope: shareScopes.string,
    consumes,
  };
}

// Helper function to create mock resolver
export function createMockResolver() {
  return {
    resolve: jest.fn(),
    withOptions: jest.fn().mockReturnThis(),
  };
}

// Helper function to reset all mocks
export function resetAllMocks() {
  jest.clearAllMocks();
  mockGetDescriptionFile.mockReset();
  resolveMatchedConfigs.mockReset();
  // Re-configure the resolveMatchedConfigs mock after reset
  resolveMatchedConfigs.mockResolvedValue({
    resolved: new Map(),
    unresolved: new Map(),
    prefixed: new Map(),
  });
  mockConsumeSharedModule.mockClear();
}
