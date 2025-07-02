import * as internalModule from './internal';
import { WEBPACK_LAYERS_NAMES } from './constants';
import type { Compiler, WebpackOptionsNormalized } from 'webpack';
import type { SharedConfig } from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';

// Mock internal-helpers
jest.mock('./internal-helpers', () => ({
  getReactVersionSafely: jest.fn(() => '18.2.0'),
}));

// Mock Next.js version detection
const mockNextVersion = jest.fn(() => '14.2.16');
const getNextVersionSpy = jest
  .spyOn(internalModule, 'getNextVersion')
  .mockImplementation(() => mockNextVersion());

const {
  getNextInternalsShareScope,
  DEFAULT_SHARE_SCOPE,
  DEFAULT_SHARE_SCOPE_BROWSER,
} = internalModule;

// Mock the client and server share scope modules with realistic data
jest.mock('./share-internals-client', () => ({
  getNextInternalsShareScopeClient: jest.fn(() => ({
    react: {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: 'next/dist/compiled/react',
      layer: 'pages-dir-browser',
      issuerLayer: 'pages-dir-browser',
      shareScope: 'default',
      version: '18.2.0',
      requiredVersion: '^18.2.0',
    },
    'react-dom': {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: 'next/dist/compiled/react-dom',
      layer: 'pages-dir-browser',
      issuerLayer: 'pages-dir-browser',
      shareScope: 'default',
      version: '18.2.0',
      requiredVersion: '^18.2.0',
    },
    'next/router': {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: 'pages-dir-browser',
      issuerLayer: 'pages-dir-browser',
      shareScope: 'default',
      singleton: true,
      requiredVersion: '^15.0.0',
      version: '15.0.0',
    },
  })),
}));

jest.mock('./share-internals-server', () => ({
  getNextInternalsShareScopeServer: jest.fn(() => ({
    react: {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: 'next/dist/compiled/react',
      layer: 'pages-dir-node',
      issuerLayer: undefined,
      shareScope: 'default',
      version: '18.2.0',
      requiredVersion: '^18.2.0',
      nodeModulesReconstructedLookup: false,
    },
    'react-dom': {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: 'next/dist/compiled/react-dom',
      layer: 'pages-dir-node',
      issuerLayer: undefined,
      shareScope: 'default',
      version: '18.2.0',
      requiredVersion: '^18.2.0',
      nodeModulesReconstructedLookup: false,
    },
    'next/router': {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: 'pages-dir-node',
      issuerLayer: undefined,
      shareScope: 'default',
      singleton: true,
      requiredVersion: '^15.0.0',
      version: '15.0.0',
      nodeModulesReconstructedLookup: true,
    },
  })),
}));

describe('getNextInternalsShareScope', () => {
  let mockCompiler: Partial<Compiler>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset Next.js version to default
    mockNextVersion.mockReturnValue('14.2.16');

    // Reset the client and server module mocks explicitly
    const {
      getNextInternalsShareScopeClient,
    } = require('./share-internals-client');
    const {
      getNextInternalsShareScopeServer,
    } = require('./share-internals-server');
    getNextInternalsShareScopeClient.mockClear();
    getNextInternalsShareScopeServer.mockClear();

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

  describe('Next.js 14 and lower (legacy behavior)', () => {
    beforeEach(() => {
      mockNextVersion.mockReturnValue('14.2.16');
    });

    it('should return DEFAULT_SHARE_SCOPE_BROWSER for client compiler', () => {
      mockCompiler.options!.name = 'client';

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result).toEqual(DEFAULT_SHARE_SCOPE_BROWSER);
      expect(result).toHaveProperty('react');
      expect(result).toHaveProperty('react-dom');
      expect(result).toHaveProperty('next/router');
      expect((result['react'] as SharedConfig).singleton).toBe(true);
    });

    it('should return DEFAULT_SHARE_SCOPE for server compiler', () => {
      mockCompiler.options!.name = 'server';

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result).toEqual(DEFAULT_SHARE_SCOPE);
      expect(result).toHaveProperty('react');
      expect(result).toHaveProperty('react-dom');
      expect(result).toHaveProperty('next/router');
      expect((result['react'] as SharedConfig).singleton).toBe(true);
    });

    it('should default to server when compiler name is undefined', () => {
      delete mockCompiler.options!.name;

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result).toEqual(DEFAULT_SHARE_SCOPE);
    });

    it('should not call client/server modules for Next.js 14', () => {
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');
      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');

      getNextInternalsShareScope(mockCompiler as Compiler);

      expect(getNextInternalsShareScopeClient).not.toHaveBeenCalled();
      expect(getNextInternalsShareScopeServer).not.toHaveBeenCalled();
    });
  });

  describe('Next.js 15+ (new behavior)', () => {
    beforeEach(() => {
      mockNextVersion.mockReturnValue('15.0.0');
    });

    it('should delegate to client configuration module for Next.js 15+', () => {
      mockCompiler.options!.name = 'client';
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(getNextInternalsShareScopeClient).toHaveBeenCalledWith(
        mockCompiler,
      );
      expect(result).toHaveProperty('react');
      expect(result).toHaveProperty('react-dom');
      expect(result).toHaveProperty('next/router');
      expect((result['react'] as SharedConfig).shareKey).toBe('react');
      expect((result['react'] as SharedConfig).shareScope).toBe('default');
    });

    it('should delegate to server configuration module for Next.js 15+', () => {
      mockCompiler.options!.name = 'server';
      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(getNextInternalsShareScopeServer).toHaveBeenCalledWith(
        mockCompiler,
      );
      expect(result).toHaveProperty('react');
      expect(result).toHaveProperty('react-dom');
      expect(result).toHaveProperty('next/router');
      expect((result['react'] as SharedConfig).shareKey).toBe('react');
      expect((result['react'] as SharedConfig).shareScope).toBe('default');
    });

    it('should default to server module when compiler name is undefined for Next.js 15+', () => {
      delete mockCompiler.options!.name;
      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(getNextInternalsShareScopeServer).toHaveBeenCalledWith(
        mockCompiler,
      );
    });
  });

  describe('Version detection', () => {
    it('should correctly detect Next.js 13 as legacy', () => {
      mockNextVersion.mockReturnValue('13.5.4');
      mockCompiler.options!.name = 'client';

      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(result).toEqual(DEFAULT_SHARE_SCOPE_BROWSER);
    });

    it('should correctly detect Next.js 15 as new', () => {
      mockNextVersion.mockReturnValue('15.1.0');
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');

      getNextInternalsShareScope(mockCompiler as Compiler);

      expect(getNextInternalsShareScopeClient).toHaveBeenCalled();
    });

    it('should correctly detect Next.js 16 as new', () => {
      mockNextVersion.mockReturnValue('16.0.0');
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');

      getNextInternalsShareScope(mockCompiler as Compiler);

      expect(getNextInternalsShareScopeClient).toHaveBeenCalled();
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

    it('should handle Next.js resolution errors gracefully', () => {
      getNextVersionSpy.mockImplementationOnce(() => {
        throw new Error(
          'Could not resolve Next.js version from compiler context.',
        );
      });

      expect(() => {
        getNextInternalsShareScope(mockCompiler as Compiler);
      }).toThrow('Could not resolve Next.js version from compiler context.');

      // Reset to normal behavior
      getNextVersionSpy.mockImplementation(() => mockNextVersion());
    });
  });

  describe('Configuration structure validation', () => {
    it('should return a valid SharedObject for Next.js 14', () => {
      mockNextVersion.mockReturnValue('14.2.16');
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should return a valid SharedObject for Next.js 15', () => {
      mockNextVersion.mockReturnValue('15.0.0');
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should ensure all configurations have required properties for Next.js 14', () => {
      mockNextVersion.mockReturnValue('14.2.16');
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      Object.values(result).forEach((config) => {
        if (typeof config === 'object' && config !== null) {
          const sharedConfig = config as SharedConfig;
          expect(sharedConfig).toHaveProperty('singleton');
          expect(sharedConfig.singleton).toBe(true);
        }
      });
    });

    it('should ensure all configurations have required properties for Next.js 15', () => {
      mockNextVersion.mockReturnValue('15.0.0');
      const result = getNextInternalsShareScope(mockCompiler as Compiler);

      // For Next.js 15+, the mocked client module returns specific configurations
      // Check that the expected properties exist on the mocked return values
      expect(result).toHaveProperty('react');
      expect(result).toHaveProperty('react-dom');
      expect(result).toHaveProperty('next/router');

      const reactConfig = result['react'] as SharedConfig;
      expect(reactConfig).toHaveProperty('singleton');
      expect(reactConfig).toHaveProperty('shareKey');
      expect(reactConfig).toHaveProperty('shareScope');
      expect(reactConfig.singleton).toBe(true);
      expect(reactConfig.shareScope).toBe('default');
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
