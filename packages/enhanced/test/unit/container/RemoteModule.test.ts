/*
 * @rstest-environment node
 */

import type { WebpackOptionsNormalized } from 'webpack';
import type { ResolverWithOptions } from 'webpack/lib/ResolverFactory';
import type { InputFileSystem } from 'webpack/lib/util/fs';
import { createMockCompilation, createWebpackMock } from './utils';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => {
  const mockGetCompilationHooks = rs.fn(() => ({
    addContainerEntryDependency: { tap: rs.fn(), call: rs.fn() },
    addFederationRuntimeDependency: { tap: rs.fn(), call: rs.fn() },
    addRemoteDependency: { tap: rs.fn(), call: rs.fn() },
  }));

  return {
    mockNormalizeWebpackPath: rs.fn((path: string) => path),
    mockHookTap: rs.fn(),
    mockHookCall: rs.fn(),
    mockAddContainerEntryDependencyHook: { tap: rs.fn(), call: rs.fn() },
    mockAddFederationRuntimeDependencyHook: { tap: rs.fn(), call: rs.fn() },
    mockAddRemoteDependencyHook: { tap: rs.fn(), call: rs.fn() },
    mockGetCompilationHooks,
    mockFederationModulesPlugin: {
      getCompilationHooks: mockGetCompilationHooks,
    },
  };
});

// Mock webpack
rs.mock('webpack', () => createWebpackMock());

// Get the webpack mock
const webpack = require('webpack');

// Add mock to make Module.serialize work - must properly handle blocks iteration
webpack.Module.prototype.serialize = rs.fn(function (this: any, context: any) {
  // The real Module.serialize iterates over blocks, so ensure blocks is iterable
  if (!this.blocks) {
    this.blocks = [];
  }
});

// Add mock for Module.deserialize
webpack.Module.prototype.deserialize = rs.fn();

// Mock dependencies
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
}));

// Import after mocks
import RemoteModule from '../../../src/lib/container/RemoteModule';

// Mock the entire FederationModulesPlugin before any imports use it
rs.mock('../../../src/lib/container/runtime/FederationModulesPlugin', () => {
  return {
    default: mocks.mockFederationModulesPlugin,
  };
});

describe('RemoteModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];
  let mockSerializeContext: any;

  beforeEach(() => {
    rs.clearAllMocks();
    rs.resetModules();

    const { mockCompilation: compilation } = createMockCompilation();
    mockCompilation = compilation;

    mockSerializeContext = {
      write: rs.fn(),
      read: rs.fn(),
    };

    // Ensure the mock compilation has processAssets hook for FederationModulesPlugin duck-type check
    if (!mockCompilation.hooks.processAssets) {
      mockCompilation.hooks.processAssets = { tap: rs.fn() };
    }
  });

  describe('constructor', () => {
    it('should initialize with basic properties', () => {
      const request = 'remote-request';
      const externalRequests = ['external-request'];
      const internalRequest = 'internal-request';
      const defaultShareScope = 'default';

      const module = new RemoteModule(
        request,
        externalRequests,
        internalRequest,
        defaultShareScope,
      );

      expect(module.request).toBe(request);
      expect(module.externalRequests).toEqual(externalRequests);
      expect(module.internalRequest).toBe(internalRequest);
      expect(module.shareScope).toBe(defaultShareScope);
    });

    it('should initialize with shareScope', () => {
      const request = 'remote-request';
      const externalRequests = ['external-request'];
      const internalRequest = 'internal-request';
      const shareScope = 'custom-scope';

      const module = new RemoteModule(
        request,
        externalRequests,
        internalRequest,
        shareScope,
      );

      expect(module.request).toBe(request);
      expect(module.externalRequests).toEqual(externalRequests);
      expect(module.internalRequest).toBe(internalRequest);
      expect(module.shareScope).toBe(shareScope);
    });
  });

  describe('identifier', () => {
    it('should generate correct identifier', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const identifier = module.identifier();
      expect(identifier).toContain('remote');
      expect(identifier).toContain('external-request');
      expect(identifier).toContain('internal-request');
    });
  });

  describe('readableIdentifier', () => {
    it('should generate readable identifier', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const readableId = module.readableIdentifier({
        shorten: (p: string) => p,
      } as any);

      expect(readableId).toContain('remote');
      expect(readableId).toContain('remote-request');
    });
  });

  describe('libIdent', () => {
    it('should generate lib identifier', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const libId = module.libIdent({
        context: '/some/context',
      } as any);

      expect(libId).toContain('webpack/container/remote/remote-request');
    });
  });

  describe('build', () => {
    it('should set buildInfo and buildMeta', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const callback = rs.fn();
      // Create a more complete mock for WebpackOptionsNormalized
      const mockOptions: Partial<WebpackOptionsNormalized> = {
        cache: true,
        entry: {},
        experiments: {},
        externals: [],
        mode: 'development',
        module: {},
        optimization: {},
        output: {},
        plugins: [],
        resolve: {},
        target: 'web',
      } as any; // Cast to any to avoid type errors

      const resolver = mockCompilation.resolverFactory.get(
        'normal',
      ) as unknown as ResolverWithOptions;
      const inputFs =
        mockCompilation.inputFileSystem as unknown as InputFileSystem;

      module.build(
        mockOptions as WebpackOptionsNormalized,
        mockCompilation,
        resolver,
        inputFs,
        callback,
      );

      expect(module.buildInfo).toBeDefined();
      expect(module.buildMeta).toBeDefined();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const request = 'remote-request';
      const externalRequests = ['external-request'];
      const internalRequest = 'internal-request';
      const shareScope = 'custom-scope';

      const module = new RemoteModule(
        request,
        externalRequests,
        internalRequest,
        shareScope,
      );

      const serializedData: any[] = [];
      const serializeContext: any = {
        write: rs.fn((value: any): number => {
          serializedData.push(value);
          return serializedData.length - 1;
        }),
      };

      module.serialize(serializeContext);

      expect(serializeContext.write).toHaveBeenCalledWith(request);
      expect(serializeContext.write).toHaveBeenCalledWith(externalRequests);
      expect(serializeContext.write).toHaveBeenCalledWith(internalRequest);
      expect(serializeContext.write).toHaveBeenCalledWith(shareScope);
      expect(webpack.Module.prototype.serialize).toHaveBeenCalledWith(
        serializeContext,
      );

      const deserializedData = [
        request,
        externalRequests,
        internalRequest,
        shareScope,
      ];

      let index = 0;
      const deserializeContext: any = {
        read: rs.fn(() => deserializedData[index++]),
        setCircularReference: rs.fn(),
      };

      const staticDeserialize = RemoteModule.deserialize as unknown as (
        context: any,
      ) => RemoteModule;

      const deserializedModule = staticDeserialize(deserializeContext);

      rs.spyOn(
        webpack.Module.prototype as any,
        'deserialize',
      ).mockImplementation(() => undefined);

      expect(deserializedModule.request).toBe(request);
      expect(deserializedModule.externalRequests).toEqual(externalRequests);
      expect(deserializedModule.internalRequest).toBe(internalRequest);
      expect(deserializedModule.shareScope).toBe(shareScope);
    });
  });

  describe('codeGeneration', () => {
    it('should generate code with correct requirements', () => {
      const module = new RemoteModule(
        'remote-request',
        ['external-request'],
        'internal-request',
        'default',
      );

      const codeGenContext = {
        moduleGraph: {
          getExportsInfo: rs.fn().mockReturnValue({
            isModuleUsed: () => true,
          }),
          getModule: rs.fn().mockReturnValue({}),
        },
        runtimeTemplate: {
          returningFunction: rs.fn(
            (args, body) => `function(${args}) { ${body} }`,
          ),
        },
        chunkGraph: {
          getModuleId: rs.fn().mockReturnValue('123'),
        },
      };

      const result = module.codeGeneration(codeGenContext as any);

      expect(result.sources).toBeDefined();
      const runtimeRequirements = Array.from(result.runtimeRequirements ?? []);
      expect(runtimeRequirements.length).toBeGreaterThan(0);
    });
  });
});
