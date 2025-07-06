import { getNextInternalsShareScope, WEBPACK_LAYERS_NAMES } from './internal';
import type { Compiler, WebpackOptionsNormalized } from 'webpack';
import type { SharedConfig } from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';

// Mock internal-helpers
jest.mock('./internal-helpers', () => ({
  getReactVersionSafely: jest.fn(() => '18.2.0'),
}));

// Mock the client and server share scope modules
jest.mock('./share-internals-client', () => ({
  getNextInternalsShareScopeClient: jest.fn(() => ({
    'react-client-config': {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      shareScope: 'default',
      version: '18.2.0',
    },
  })),
}));

jest.mock('./share-internals-server', () => ({
  getNextInternalsShareScopeServer: jest.fn(() => ({
    'react-server-config': {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      shareScope: 'default',
      version: '18.2.0',
    },
  })),
}));

describe('getNextInternalsShareScope', () => {
  let mockCompiler: Partial<Compiler>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

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

  describe('Client/Server configuration delegation', () => {
    it('should delegate to client configuration module', () => {
      mockCompiler.options!.name = 'client';

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should use mocked client configuration
      expect(result).toHaveProperty('react-client-config');
      expect((result['react-client-config'] as SharedConfig).shareKey).toBe(
        'react',
      );
    });

    it('should delegate to server configuration module', () => {
      mockCompiler.options!.name = 'server';

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should use mocked server configuration
      expect(result).toHaveProperty('react-server-config');
      expect((result['react-server-config'] as SharedConfig).shareKey).toBe(
        'react',
      );
    });

    it('should default to server when compiler name is undefined', () => {
      delete mockCompiler.options!.name;

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should use server configuration as default
      expect(result).toHaveProperty('react-server-config');
    });
  });

  describe('Module delegation verification', () => {
    it('should call client configuration module correctly', () => {
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');
      mockCompiler.options!.name = 'client';

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should have called the client module
      expect(getNextInternalsShareScopeClient).toHaveBeenCalledWith(
        mockCompiler,
      );
      expect(result).toHaveProperty('react-client-config');
    });

    it('should call server configuration module correctly', () => {
      mockCompiler.options!.name = 'server';
      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should have called the server module
      expect(getNextInternalsShareScopeServer).toHaveBeenCalledWith(
        mockCompiler,
      );
      expect(result).toHaveProperty('react-server-config');
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
    it('should return a valid SharedObject', () => {
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should ensure all configurations have required properties', () => {
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      Object.values(result).forEach((config) => {
        if (typeof config === 'object') {
          const sharedConfig = config as SharedConfig;
          expect(sharedConfig).toHaveProperty('singleton');
          expect(sharedConfig).toHaveProperty('shareKey');
          expect(sharedConfig).toHaveProperty('shareScope');
          expect(sharedConfig.singleton).toBe(true);
        }
      });
    });
  });

  describe('Integration with existing share configurations', () => {
    it('should delegate to client module for client builds', () => {
      mockCompiler.options!.name = 'client';

      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should have called the existing client configuration
      expect(getNextInternalsShareScopeClient).toHaveBeenCalledWith(
        mockCompiler,
      );
      expect(result).toEqual({
        'react-client-config': {
          request: 'react',
          singleton: true,
          shareKey: 'react',
          shareScope: 'default',
          version: '18.2.0',
        },
      });
    });

    it('should delegate to server module for server builds', () => {
      mockCompiler.options!.name = 'server';

      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // Should have called the existing server configuration
      expect(getNextInternalsShareScopeServer).toHaveBeenCalledWith(
        mockCompiler,
      );
      expect(result).toEqual({
        'react-server-config': {
          request: 'react',
          singleton: true,
          shareKey: 'react',
          shareScope: 'default',
          version: '18.2.0',
        },
      });
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
    });
  });
});
