import * as internalModule from './internal';
import { WEBPACK_LAYERS_NAMES } from './constants';
import type { Compiler, WebpackOptionsNormalized } from 'webpack';
import type { SharedConfig } from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';

// Mock internal-helpers
jest.mock('./internal-helpers', () => ({
  getReactVersionSafely: jest.fn(() => '18.2.0'),
}));

const {
  getNextInternalsShareScope,
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
} = internalModule;

describe('getNextInternalsShareScope', () => {
  let mockCompiler: Partial<Compiler>;

  beforeEach(() => {
    // Setup common compiler mock
    mockCompiler = {
      context: '/mock/project',
      options: {
        name: 'client', // Default to client
      } as any,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return a valid SharedObject', () => {
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should include React configurations', () => {
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result).toHaveProperty('react');
      expect(result).toHaveProperty('react-dom');
      expect((result['react'] as SharedConfig).singleton).toBe(true);
    });

    it('should include Next.js configurations', () => {
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result).toHaveProperty('next/router');
      expect(result).toHaveProperty('next/head');
      expect(result).toHaveProperty('next/image');
      expect((result['next/router'] as SharedConfig).singleton).toBe(true);
    });

    it('should handle different compiler names', () => {
      // Test client compiler
      mockCompiler.options!.name = 'client';
      const clientResult = getNextInternalsShareScope(mockCompiler as Compiler);
      expect(clientResult).toBeDefined();

      // Test server compiler
      mockCompiler.options!.name = 'server';
      const serverResult = getNextInternalsShareScope(mockCompiler as Compiler);
      expect(serverResult).toBeDefined();

      // Both should have React configurations
      expect(clientResult).toHaveProperty('react');
      expect(serverResult).toHaveProperty('react');
    });
  });

  describe('Error handling', () => {
    it('should handle missing compiler context gracefully', () => {
      delete mockCompiler.context;

      expect(() => {
        getNextInternalsShareScope(mockCompiler as Compiler);
      }).toThrow(
        'Compiler context is not available. Cannot resolve Next.js version.',
      );
    });
  });

  describe('Configuration structure validation', () => {
    it('should ensure all configurations have required properties', () => {
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      Object.values(result).forEach((config) => {
        if (typeof config === 'object' && config !== null) {
          const sharedConfig = config as SharedConfig;
          expect(sharedConfig).toHaveProperty('singleton');
          expect(sharedConfig.singleton).toBe(true);
        }
      });
    });

    it('should return consistent results for the same compiler', () => {
      const result1 = getNextInternalsShareScope(mockCompiler as Compiler);
      const result2 = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result1).toEqual(result2);
    });
  });

  describe('Function exports and API', () => {
    it('should export getNextInternalsShareScope function', () => {
      expect(getNextInternalsShareScope).toBeDefined();
      expect(typeof getNextInternalsShareScope).toBe('function');
    });

    it('should export WEBPACK_LAYERS_NAMES constant', () => {
      expect(WEBPACK_LAYERS_NAMES).toBeDefined();
      expect(typeof WEBPACK_LAYERS_NAMES).toBe('object');
      expect(WEBPACK_LAYERS_NAMES.appPagesBrowser).toBe('app-pages-browser');
      expect(WEBPACK_LAYERS_NAMES.reactServerComponents).toBe('rsc');
      expect(WEBPACK_LAYERS_NAMES.pagesDirBrowser).toBe('pages-dir-browser');
      expect(WEBPACK_LAYERS_NAMES.pagesDirNode).toBe('pages-dir-node');
    });

    it('should export DEFAULT_SHARE_SCOPE constant', () => {
      expect(DEFAULT_SHARE_SCOPE).toBeDefined();
      expect(typeof DEFAULT_SHARE_SCOPE).toBe('object');
      expect(DEFAULT_SHARE_SCOPE).toHaveProperty('react');
      expect(DEFAULT_SHARE_SCOPE).toHaveProperty('react-dom');
      expect(DEFAULT_SHARE_SCOPE).toHaveProperty('next/router');
    });

    it('should export DEFAULT_SHARE_SCOPE_BROWSER constant', () => {
      expect(DEFAULT_SHARE_SCOPE_BROWSER).toBeDefined();
      expect(typeof DEFAULT_SHARE_SCOPE_BROWSER).toBe('object');
      expect(DEFAULT_SHARE_SCOPE_BROWSER).toHaveProperty('react');
      expect(DEFAULT_SHARE_SCOPE_BROWSER).toHaveProperty('react-dom');
      expect(DEFAULT_SHARE_SCOPE_BROWSER).toHaveProperty('next/router');
    });
  });
});
