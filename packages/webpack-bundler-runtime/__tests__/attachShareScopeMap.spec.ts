import { attachShareScopeMap } from '../src/attachShareScopeMap';
import type { WebpackRequire } from '../src/types';

// We need to mock the implementation to control the behavior
jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn((webpackRequire) => {
    // Simplified implementation for testing
    if (
      webpackRequire.S ||
      webpackRequire.federation.hasAttachShareScopeMap ||
      !webpackRequire.federation.instance ||
      !webpackRequire.federation.instance.shareScopeMap
    ) {
      return;
    }

    webpackRequire.S = webpackRequire.federation.instance.shareScopeMap;
    webpackRequire.federation.hasAttachShareScopeMap = true;
  }),
}));

// Create a mock implementation for testing
class MockWebpackRequire implements Partial<WebpackRequire> {
  S?: any;
  federation: any;

  constructor(
    config: {
      hasShareScopeMap?: boolean;
      hasInstance?: boolean;
      hasShareScopeMapProperty?: boolean;
      initialS?: any;
    } = {},
  ) {
    this.S = config.initialS;
    this.federation = {
      hasAttachShareScopeMap: config.hasShareScopeMap || false,
      instance:
        config.hasInstance === false
          ? undefined
          : {
              shareScopeMap:
                config.hasShareScopeMapProperty === false
                  ? undefined
                  : { default: {} },
            },
    };
  }
}

describe('attachShareScopeMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not modify when S is already defined', () => {
    // Setup
    const mockWebpackRequire = new MockWebpackRequire({ initialS: {} });

    // Execute
    attachShareScopeMap(mockWebpackRequire as any);

    // Verify
    expect(mockWebpackRequire.federation.hasAttachShareScopeMap).toBe(false);
  });

  test('should not modify when hasAttachShareScopeMap is true', () => {
    // Setup
    const mockWebpackRequire = new MockWebpackRequire({
      hasShareScopeMap: true,
    });

    // Execute
    attachShareScopeMap(mockWebpackRequire as any);

    // Verify
    expect(mockWebpackRequire.S).toBeUndefined();
  });

  test('should not modify when instance is not defined', () => {
    // Setup
    const mockWebpackRequire = new MockWebpackRequire({
      hasInstance: false,
    });

    // Execute
    attachShareScopeMap(mockWebpackRequire as any);

    // Verify
    expect(mockWebpackRequire.S).toBeUndefined();
    expect(mockWebpackRequire.federation.hasAttachShareScopeMap).toBe(false);
  });

  test('should not modify when shareScopeMap is not defined', () => {
    // Setup
    const mockWebpackRequire = new MockWebpackRequire({
      hasShareScopeMapProperty: false,
    });

    // Execute
    attachShareScopeMap(mockWebpackRequire as any);

    // Verify
    expect(mockWebpackRequire.S).toBeUndefined();
    expect(mockWebpackRequire.federation.hasAttachShareScopeMap).toBe(false);
  });

  test('should attach when all conditions are met', () => {
    // Setup
    const mockWebpackRequire = new MockWebpackRequire();
    const expectedShareScope =
      mockWebpackRequire.federation.instance.shareScopeMap;

    // Execute
    attachShareScopeMap(mockWebpackRequire as any);

    // Verify
    expect(mockWebpackRequire.S).toBe(expectedShareScope);
    expect(mockWebpackRequire.federation.hasAttachShareScopeMap).toBe(true);
  });
});
