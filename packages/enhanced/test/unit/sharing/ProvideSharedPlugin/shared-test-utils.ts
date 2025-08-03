/*
 * Shared test utilities and mocks for ProvideSharedPlugin tests
 */

import {
  shareScopes,
  createMockCompiler,
  createMockCompilation,
  testModuleOptions,
  createWebpackMock,
  createModuleMock,
} from '../utils';

// Create webpack mock
export const webpack = createWebpackMock();
// Create Module mock
export const Module = createModuleMock(webpack);

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => {
    return jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    }));
  },
);

// Mock ProvideSharedDependency
export class MockProvideSharedDependency {
  constructor(
    public request: string,
    public shareScope: string | string[],
    public version: string,
  ) {
    this._shareScope = shareScope;
    this._version = version;
    this._shareKey = request;
  }

  // Add required properties that are accessed during tests
  _shareScope: string | string[];
  _version: string;
  _shareKey: string;
}

jest.mock('../../../../src/lib/sharing/ProvideSharedDependency', () => {
  return MockProvideSharedDependency;
});

jest.mock('../../../../src/lib/sharing/ProvideSharedModuleFactory', () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  }));
});

// Mock ProvideSharedModule
jest.mock('../../../../src/lib/sharing/ProvideSharedModule', () => {
  return jest.fn().mockImplementation((options) => ({
    _shareScope: options.shareScope,
    _shareKey: options.shareKey || options.request, // Add fallback to request for shareKey
    _version: options.version,
    _eager: options.eager || false,
    options,
  }));
});

// Import after mocks are set up
export const ProvideSharedPlugin =
  require('../../../../src/lib/sharing/ProvideSharedPlugin').default;

// Re-export utilities from parent utils
export {
  shareScopes,
  createMockCompiler,
  createMockCompilation,
  testModuleOptions,
};

// Common test data
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

// Helper function to create test module with common properties
export function createTestModule(overrides = {}) {
  return {
    ...testModuleOptions,
    ...overrides,
  };
}

// Helper function to create test configuration
export function createTestConfig(
  provides = testProvides,
  shareScope = shareScopes.string,
) {
  return {
    shareScope,
    provides,
  };
}
